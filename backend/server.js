import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb, getPool } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');
const frontendDistDir = path.join(__dirname, '..', 'dist');
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret-before-production';

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Configure Multer for local disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const rolePermissions = {
  'Consultant JMO': ['read', 'write', 'reports', 'evidence'],
  'Medical Officer': ['read', 'write', 'reports', 'evidence'],
  'Forensic Support Staff': ['read', 'evidence'],
  'Data Entry Operator': ['read', 'write', 'evidence'],
  'Hospital Administration': ['read', 'reports'],
  'System Administrator': ['read', 'write', 'reports', 'evidence', 'admin'],
};

// Initialize Database
await initDb().catch((err) => {
  console.error('Critical database initialization failure:', err);
  process.exit(1);
});

// Helper for query execution
async function query(sql, params) {
  const pool = getPool();
  const [results] = await pool.query(sql, params);
  return results;
}

// Helper to format Date objects to YYYY-MM-DD in local timezone
function formatDate(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to log audit trails
async function logAudit(action, username, details) {
  try {
    const id = 'log_' + Math.random().toString(36).substr(2, 9);
    const dateStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
    await query(
      'INSERT INTO audit_logs (id, action, user_name, timestamp, details) VALUES (?, ?, ?, ?, ?)',
      [id, action, username, dateStr, details]
    );
  } catch (error) {
    console.error('Failed to log audit activity:', error);
  }
}

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'forensic-backend' });
});

// 1. Authentication Login
app.post('/api/auth/login', async (req, res) => {
  const { email, role, password } = req.body;
  if (!email || !role || !password) {
    return res.status(400).json({ error: 'Email, role, and password are required' });
  }

  try {
    const results = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email address' });
    }

    const user = results[0];
    if (user.role !== role) {
      return res.status(401).json({ error: 'Role mismatch' });
    }

    const hasHashedPassword = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    const passwordMatches = hasHashedPassword
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    await logAudit('User Login', user.name, `Successful login via role: ${role}`);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server authentication error' });
  }
});

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = rolePermissions[req.user?.role] || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

app.use('/api', authenticate);

// 2. Fetch Doctors List
app.get('/api/doctors', async (req, res) => {
  try {
    const results = await query(`
      SELECT person_id as id, name_with_initials as name 
      FROM person 
      WHERE person_id IN (SELECT person_id FROM jmo UNION SELECT person_id FROM mo)
    `);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch doctors list' });
  }
});

// 3. Dashboard Statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [activeCases] = await query("SELECT COUNT(*) as count FROM investigation_cases WHERE status = 'Active'");
    const [pendingReports] = await query("SELECT COUNT(*) as count FROM reports_meta WHERE status != 'Issued'");
    const [upcomingCourtDates] = await query("SELECT COUNT(*) as count FROM summon WHERE court_date >= CURDATE()");
    const [issuedThisMonth] = await query("SELECT COUNT(*) as count FROM reports_meta WHERE status = 'Issued'");

    // Fetch up to 3 upcoming summons
    const upcomingSummons = await query(`
      SELECT 
        s.case_id as caseId, 
        s.court_date as courtDate, 
        s.who_issued as whoIssued, 
        COALESCE(p.name_with_initials, d.name_with_initials) as patientName 
      FROM summon s 
      JOIN investigation_cases c ON s.case_id = c.case_id 
      LEFT JOIN patient pat ON c.patient_id = pat.person_id 
      LEFT JOIN person p ON pat.person_id = p.person_id 
      LEFT JOIN decedent d ON c.decedent_id = d.decedent_id 
      WHERE s.court_date >= CURDATE() 
      ORDER BY s.court_date ASC 
      LIMIT 3
    `);

    const recentCases = await query(`
      SELECT 
        c.case_id as id, 
        c.type, 
        COALESCE(p.name_with_initials, d.name_with_initials) as patientName, 
        c.date_registered as date, 
        c.status, 
        doc.name_with_initials as doctor 
      FROM investigation_cases c 
      LEFT JOIN patient pat ON c.patient_id = pat.person_id 
      LEFT JOIN person p ON pat.person_id = p.person_id 
      LEFT JOIN decedent d ON c.decedent_id = d.decedent_id 
      LEFT JOIN person doc ON c.doctor_id = doc.person_id 
      ORDER BY c.date_registered DESC 
      LIMIT 4
    `);

    res.json({
      activeCases: activeCases.count,
      pendingReports: pendingReports.count,
      upcomingCourtDates: upcomingCourtDates.count,
      issuedThisMonth: issuedThisMonth.count,
      upcomingSummons: upcomingSummons.map(s => ({
        ...s,
        courtDate: formatDate(s.courtDate)
      })),
      recentCases: recentCases.map(c => ({
        ...c,
        date: formatDate(c.date)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// 4. Get Case List
app.get('/api/cases', async (req, res) => {
  const { type, search } = req.query;
  try {
    let sql = `
      SELECT 
        c.case_id as id, 
        c.type, 
        COALESCE(p.name_with_initials, d.name_with_initials) as patientName, 
        c.date_registered as date, 
        c.status, 
        doc.name_with_initials as doctor 
      FROM investigation_cases c 
      LEFT JOIN patient pat ON c.patient_id = pat.person_id 
      LEFT JOIN person p ON pat.person_id = p.person_id 
      LEFT JOIN decedent d ON c.decedent_id = d.decedent_id 
      LEFT JOIN person doc ON c.doctor_id = doc.person_id 
      WHERE 1=1
    `;
    const params = [];

    if (type) {
      sql += ' AND c.type = ?';
      params.push(type);
    }

    if (search) {
      sql += ' AND (c.case_id LIKE ? OR p.name_with_initials LIKE ? OR d.name_with_initials LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ' ORDER BY c.case_id DESC';

    const results = await query(sql, params);
    res.json(results.map(c => ({
      ...c,
      date: formatDate(c.date)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// 5. Get Single Case Details (with evidence, reports, summons)
app.get('/api/cases/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const caseResult = await query(`
      SELECT 
        c.case_id as id, 
        c.type, 
        COALESCE(p.name_with_initials, d.name_with_initials) as patientName, 
        c.date_registered as date, 
        c.status, 
        doc.name_with_initials as doctor 
      FROM investigation_cases c 
      LEFT JOIN patient pat ON c.patient_id = pat.person_id 
      LEFT JOIN person p ON pat.person_id = p.person_id 
      LEFT JOIN decedent d ON c.decedent_id = d.decedent_id 
      LEFT JOIN person doc ON c.doctor_id = doc.person_id 
      WHERE c.case_id = ?
    `, [id]);

    if (caseResult.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const c = caseResult[0];

    // Fetch related evidence (media)
    const evidence = await query(`
      SELECT 
        media_id as id, 
        case_id as caseId, 
        scanned_copy, 
        media_type as size, 
        doc_type as type, 
        uploaded_at as uploadedAt 
      FROM media 
      WHERE case_id = ?
    `, [id]);

    const formattedEvidence = evidence.map(item => {
      const parts = item.scanned_copy.split('|');
      const name = parts[0];
      const filename = parts[1] || parts[0];
      return {
        id: item.id,
        caseId: item.caseId,
        name,
        filename,
        size: item.size,
        type: item.type,
        uploadedAt: item.uploadedAt
      };
    });

    // Fetch related reports
    const reports = await query(`
      SELECT 
        id, 
        case_id as caseId, 
        type, 
        status, 
        date 
      FROM reports_meta 
      WHERE case_id = ?
    `, [id]);

    // Fetch related summons
    const summons = await query(`
      SELECT 
        summon_id as id, 
        case_id as caseId, 
        who_issued as whoIssued, 
        court_date as courtDate, 
        date_of_issue as dateOfIssue 
      FROM summon 
      WHERE case_id = ?
    `, [id]);

    res.json({
      caseData: {
        ...c,
        date: formatDate(c.date)
      },
      evidence: formattedEvidence,
      reports: reports.map(r => ({
        ...r,
        date: formatDate(r.date)
      })),
      summons: summons.map(s => ({
        ...s,
        courtDate: formatDate(s.courtDate),
        dateOfIssue: formatDate(s.dateOfIssue)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch case details' });
  }
});

// 6. Create Case
app.post('/api/cases', requirePermission('write'), async (req, res) => {
  const { type, patientName, date, doctorId, username } = req.body;
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const randNum = Math.floor(100 + Math.random() * 900);
    const caseId = `2026${randNum}`;
    const subjectId = 'sub_' + Math.random().toString(36).substr(2, 9);

    if (type === 'Clinical Forensic') {
      await connection.query(
        'INSERT INTO person (person_id, name_with_initials, gender) VALUES (?, ?, ?)',
        [subjectId, patientName, 'Male']
      );
      await connection.query('INSERT INTO patient (person_id) VALUES (?)', [subjectId]);

      await connection.query(
        'INSERT INTO investigation_cases (case_id, type, status, date_registered, patient_id, decedent_id, doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [caseId, type, 'Active', date, subjectId, null, doctorId]
      );
    } else {
      await connection.query(
        'INSERT INTO decedent (decedent_id, name_with_initials, gender) VALUES (?, ?, ?)',
        [subjectId, patientName, 'Male']
      );

      await connection.query(
        'INSERT INTO investigation_cases (case_id, type, status, date_registered, patient_id, decedent_id, doctor_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [caseId, type, 'Active', date, null, subjectId, doctorId]
      );
    }

    await connection.commit();
    await logAudit('Case Created', username || 'Data Entry Operator', `Created case #${caseId} for ${patientName}`);

    res.json({ id: caseId, patientName, type, date, status: 'Active' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to create case' });
  } finally {
    connection.release();
  }
});

// 7. Update Case Status
app.put('/api/cases/:id/status', requirePermission('write'), async (req, res) => {
  const { id } = req.params;
  const { status, username } = req.body;
  try {
    await query('UPDATE investigation_cases SET status = ? WHERE case_id = ?', [status, id]);
    await logAudit('Case Updated', username || 'Doctor', `Updated case #${id} status to ${status}`);
    res.json({ success: true, status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// 8. Get Evidence List (Recent uploads)
app.get('/api/evidence', async (req, res) => {
  try {
    const results = await query(`
      SELECT 
        media_id as id, 
        case_id as caseId, 
        scanned_copy, 
        media_type as size, 
        doc_type as type, 
        uploaded_at as uploadedAt 
      FROM media 
      ORDER BY uploaded_at DESC
    `);
    res.json(results.map(item => {
      const parts = item.scanned_copy.split('|');
      const name = parts[0];
      const filename = parts[1] || parts[0];
      return {
        id: item.id,
        caseId: item.caseId,
        name,
        filename,
        size: item.size,
        type: item.type,
        uploadedAt: item.uploadedAt
      };
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch evidence list' });
  }
});

// 9. Add Evidence (handles real file uploads via multer)
app.post('/api/evidence', requirePermission('evidence'), upload.single('file'), async (req, res) => {
  try {
    const { caseId, username } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const id = 'ev_' + Math.random().toString(36).substr(2, 9);
    const uploadedAt = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');

    const isImage = file.mimetype.startsWith('image/');
    const docType = isImage ? 'image' : 'document';
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const scannedCopyVal = `${file.originalname}|${file.filename}`;

    await query(
      'INSERT INTO media (media_id, case_id, doc_type, scanned_copy, media_type, uploaded_at, uploaded_by, mime_type, original_filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, caseId, docType, scannedCopyVal, sizeMB, uploadedAt, req.user?.id || null, file.mimetype, file.originalname]
    );

    await logAudit('Evidence Uploaded', username || 'System User', `Uploaded evidence file "${file.originalname}" to case #${caseId}`);
    
    res.json({ 
      id, 
      caseId, 
      name: file.originalname, 
      filename: file.filename,
      size: sizeMB, 
      type: docType, 
      uploadedAt 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add evidence record' });
  }
});

// 10. Get Reports List
app.get('/api/reports', async (req, res) => {
  try {
    const results = await query(`
      SELECT 
        id, 
        case_id as caseId, 
        type, 
        status, 
        date 
      FROM reports_meta 
      ORDER BY date DESC
    `);
    res.json(results.map(r => ({
      ...r,
      date: formatDate(r.date)
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reports list' });
  }
});

// 11. Generate Report
app.post('/api/reports', requirePermission('reports'), async (req, res) => {
  const { caseId, type, username } = req.body;
  try {
    const id = 'rep_' + Math.random().toString(36).substr(2, 9);
    const dateStr = formatDate(new Date());
    const status = type === 'MLEF' ? 'Drafted' : 'Pending Signature';

    await query(
      'INSERT INTO reports_meta (id, case_id, type, status, date) VALUES (?, ?, ?, ?, ?)',
      [id, caseId, type, status, dateStr]
    );

    await logAudit('Report Generated', username || 'Doctor', `Generated ${type} report draft for case #${caseId}`);
    res.json({ id, caseId, type, status, date: dateStr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// 12. Fetch Audit Logs
app.get('/api/audit-logs', requirePermission('admin'), async (req, res) => {
  try {
    const results = await query('SELECT id, action, user_name as user, timestamp, details FROM audit_logs ORDER BY timestamp DESC LIMIT 50');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// 13. Link New Summon
app.post('/api/summons', requirePermission('write'), async (req, res) => {
  const { caseId, whoIssued, courtDate, dateOfIssue, username } = req.body;
  try {
    const id = 'sum_' + Math.random().toString(36).substr(2, 9);
    await query(
      'INSERT INTO summon (summon_id, case_id, who_issued, court_date, date_of_issue) VALUES (?, ?, ?, ?, ?)',
      [id, caseId, whoIssued, courtDate, dateOfIssue]
    );
    await logAudit('Summons Linked', username || 'System User', `Linked court summon ${id} issued by ${whoIssued} for date ${courtDate} to case #${caseId}`);
    res.json({ id, caseId, whoIssued, courtDate, dateOfIssue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to link summon' });
  }
});

// Start Server
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
