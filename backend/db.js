import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

let pool;

export async function initDb() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'forensic_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log(`Connected to MySQL database: ${dbName}`);

    await createTables();
    await seedData();

  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDb() first.');
  }
  return pool;
}

async function createTables() {
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS person (
      person_id VARCHAR(50) PRIMARY KEY,
      name_with_initials VARCHAR(255) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      dob DATE,
      nic VARCHAR(30),
      contact_no VARCHAR(20),
      age INT
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS person_contact (
      person_id VARCHAR(50) NOT NULL,
      contact_no VARCHAR(20) NOT NULL,
      PRIMARY KEY (person_id, contact_no),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS jmo (
      person_id VARCHAR(50) PRIMARY KEY,
      jmo_id VARCHAR(50) UNIQUE NOT NULL,
      role VARCHAR(100),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS mo (
      person_id VARCHAR(50) PRIMARY KEY,
      mo_id VARCHAR(50) UNIQUE NOT NULL,
      department VARCHAR(100),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS police (
      person_id VARCHAR(50) PRIMARY KEY,
      police_id VARCHAR(50) UNIQUE NOT NULL,
      role VARCHAR(100),
      station VARCHAR(255),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS isd (
      person_id VARCHAR(50) PRIMARY KEY,
      isd_id VARCHAR(50) UNIQUE NOT NULL,
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS patient (
      person_id VARCHAR(50) PRIMARY KEY,
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS decedent (
      decedent_id VARCHAR(50) PRIMARY KEY,
      name_with_initials VARCHAR(255) NOT NULL,
      gender VARCHAR(20) NOT NULL,
      dob DATE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS investigation_cases (
      case_id VARCHAR(50) PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      date_registered DATE NOT NULL,
      patient_id VARCHAR(50),
      decedent_id VARCHAR(50),
      doctor_id VARCHAR(50),
      police_id VARCHAR(50),
      FOREIGN KEY (patient_id) REFERENCES patient(person_id) ON DELETE SET NULL,
      FOREIGN KEY (decedent_id) REFERENCES decedent(decedent_id) ON DELETE SET NULL,
      FOREIGN KEY (doctor_id) REFERENCES person(person_id) ON DELETE SET NULL,
      FOREIGN KEY (police_id) REFERENCES police(person_id) ON DELETE SET NULL
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS clinical_record (
      clinical_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      doc_type VARCHAR(100),
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS mlef (
      mlef_id VARCHAR(50) PRIMARY KEY,
      clinical_id VARCHAR(50) NOT NULL,
      date_of_issue DATE,
      scanned_copy VARCHAR(255),
      is_issued_to_police BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (clinical_id) REFERENCES clinical_record(clinical_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS referral (
      referral_id VARCHAR(50) PRIMARY KEY,
      clinical_id VARCHAR(50) NOT NULL,
      referred_from VARCHAR(255),
      referred_to VARCHAR(255),
      FOREIGN KEY (clinical_id) REFERENCES clinical_record(clinical_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS pmr (
      pmr_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      date_and_time_of_performance DATETIME,
      place_of_death VARCHAR(255),
      cause_of_death VARCHAR(255),
      date_and_time_of_death DATETIME,
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS summon (
      summon_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      who_issued VARCHAR(255),
      court_date DATE,
      scanned_copy VARCHAR(255),
      date_of_issue DATE,
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS court_order (
      court_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      court_issued VARCHAR(255),
      judge_id VARCHAR(50),
      judge_name VARCHAR(255),
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS certificate_of_receipt (
      receipt_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      scanned_copy VARCHAR(255),
      date DATE,
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS mlr (
      mlr_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      scanned_copy VARCHAR(255),
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS media (
      media_id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      doc_type VARCHAR(100),
      scanned_copy VARCHAR(255),
      media_type VARCHAR(100),
      uploaded_at VARCHAR(100),
      uploaded_by VARCHAR(50),
      mime_type VARCHAR(100),
      original_filename VARCHAR(255),
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  await ensureColumn(p, 'media', 'uploaded_by', 'VARCHAR(50)');
  await ensureColumn(p, 'media', 'mime_type', 'VARCHAR(100)');
  await ensureColumn(p, 'media', 'original_filename', 'VARCHAR(255)');

  await p.query(`
    CREATE TABLE IF NOT EXISTS doctor_media (
      person_id VARCHAR(50) NOT NULL,
      media_id VARCHAR(50) NOT NULL,
      PRIMARY KEY (person_id, media_id),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE CASCADE,
      FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS judge (
      judge_id VARCHAR(50) PRIMARY KEY,
      judge_name VARCHAR(255) NOT NULL
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      person_id VARCHAR(50),
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE SET NULL
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(50) PRIMARY KEY,
      action VARCHAR(255) NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      timestamp VARCHAR(100) NOT NULL,
      details TEXT NOT NULL
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS reports_meta (
      id VARCHAR(50) PRIMARY KEY,
      case_id VARCHAR(50) NOT NULL,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL,
      date VARCHAR(100) NOT NULL,
      FOREIGN KEY (case_id) REFERENCES investigation_cases(case_id) ON DELETE CASCADE
    )
  `);

  console.log('Tables created or verified successfully.');
}

async function ensureColumn(pool, tableName, columnName, definition) {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS count
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  if (rows[0].count === 0) {
    await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
  }
}

async function seedData() {
  const p = getPool();

  // 1. Seed Main Tables (checking users)
  const [rows] = await p.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    console.log('Database empty. Seeding initial data...');

    const persons = [
      ['p_doc1', 'Dr. A. Perera', 'Male', '1980-05-12', '198012345V', '0771234567', 46],
      ['p_doc2', 'Dr. B. Silva', 'Male', '1982-08-20', '198223456V', '0772345678', 44],
      ['p_doc3', 'Dr. C. Fernando', 'Male', '1978-02-15', '197834567V', '0773456789', 48],
      ['p_op1', 'Data Entry Operator', 'Female', '1995-10-10', '199545678V', '0774567890', 31],
      ['p_admin1', 'System Administrator', 'Male', '1990-01-01', '199056789V', '0775678901', 36],
      ['p_staff1', 'Forensic Support Staff', 'Female', '1993-04-05', '199367890V', '0776789012', 33],
      ['p_admin2', 'Hospital Administrator', 'Female', '1989-03-11', '198934567V', '0771112233', 37],
      ['p_pat1', 'John Doe', 'Male', '1990-01-15', '199011122V', '0779998887', 36],
      ['p_pat2', 'Michael Brown', 'Male', '1988-07-22', '198822334V', '0778887776', 37]
    ];
    for (const person of persons) {
      await p.query(
        'INSERT INTO person (person_id, name_with_initials, gender, dob, nic, contact_no, age) VALUES (?, ?, ?, ?, ?, ?, ?)',
        person
      );
    }

    await p.query('INSERT INTO jmo (person_id, jmo_id, role) VALUES (?, ?, ?)', ['p_doc1', 'jmo1', 'Consultant JMO']);
    await p.query('INSERT INTO jmo (person_id, jmo_id, role) VALUES (?, ?, ?)', ['p_doc3', 'jmo2', 'Consultant JMO']);
    await p.query('INSERT INTO mo (person_id, mo_id, department) VALUES (?, ?, ?)', ['p_doc2', 'mo1', 'Forensic Medicine']);
    await p.query('INSERT INTO patient (person_id) VALUES (?)', ['p_pat1']);
    await p.query('INSERT INTO patient (person_id) VALUES (?)', ['p_pat2']);

    await p.query('INSERT INTO decedent (decedent_id, name_with_initials, gender, dob) VALUES (?, ?, ?, ?)', ['dec1', 'Jane Smith', 'Female', '1992-11-03']);
    await p.query('INSERT INTO decedent (decedent_id, name_with_initials, gender, dob) VALUES (?, ?, ?, ?)', ['dec2', 'Unknown', 'Unknown', null]);

    const policeOfficers = [
      ['p_pol1', 'pol1', 'Sergeant', 'Kandy Police Station'],
      ['p_pol2', 'pol2', 'Sub-Inspector', 'Peradeniya Police Station']
    ];
    for (const officer of policeOfficers) {
      await p.query('INSERT INTO person (person_id, name_with_initials, gender) VALUES (?, ?, ?)', [officer[0], officer[2] + ' ' + officer[3].split(' ')[0], 'Male']);
      await p.query('INSERT INTO police (person_id, police_id, role, station) VALUES (?, ?, ?, ?)', officer);
    }

    const cases = [
      ['2026101', 'Clinical Forensic', 'Active', '2026-06-01', 'p_pat1', null, 'p_doc1', 'p_pol1'],
      ['2026102', 'Autopsy', 'Pending PMR', '2026-06-02', null, 'dec1', 'p_doc2', 'p_pol2'],
      ['2026103', 'Clinical Forensic', 'Closed', '2026-06-02', 'p_pat2', null, 'p_doc1', 'p_pol1'],
      ['2026104', 'Autopsy', 'Active', '2026-06-03', null, 'dec2', 'p_doc3', 'p_pol2']
    ];
    for (const c of cases) {
      await p.query(
        'INSERT INTO investigation_cases (case_id, type, status, date_registered, patient_id, decedent_id, doctor_id, police_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        c
      );
    }

    await p.query('INSERT INTO clinical_record (clinical_id, case_id, doc_type) VALUES (?, ?, ?)', ['cl1', '2026101', 'MLEF']);
    await p.query('INSERT INTO clinical_record (clinical_id, case_id, doc_type) VALUES (?, ?, ?)', ['cl2', '2026103', 'MLEF']);
    await p.query('INSERT INTO mlef (mlef_id, clinical_id, date_of_issue, scanned_copy, is_issued_to_police) VALUES (?, ?, ?, ?, ?)', ['m1', 'cl1', '2026-06-01', 'mlef_2026101.pdf', true]);
    await p.query('INSERT INTO mlef (mlef_id, clinical_id, date_of_issue, scanned_copy, is_issued_to_police) VALUES (?, ?, ?, ?, ?)', ['m2', 'cl2', '2026-06-02', 'mlef_2026103.pdf', true]);

    await p.query(
      'INSERT INTO pmr (pmr_id, case_id, date_and_time_of_performance, place_of_death, cause_of_death, date_and_time_of_death) VALUES (?, ?, ?, ?, ?, ?)',
      ['pm1', '2026102', '2026-06-02 09:00:00', 'Hospital Morgue', 'Multiple Traumatic Injuries', '2026-06-02 02:30:00']
    );

    const mediaItems = [
      ['ev1', '2026101', 'image', 'Crime_Scene_1.jpg', '2.4 MB', '2026-06-01 10:00 AM', 'u1', 'image/jpeg', 'Crime_Scene_1.jpg'],
      ['ev2', '2026101', 'document', 'MLEF_Draft.pdf', '1.2 MB', '2026-06-01 11:30 AM', 'u1', 'application/pdf', 'MLEF_Draft.pdf'],
      ['ev3', '2026102', 'document', 'Toxicology_Report.pdf', '840 KB', '2026-06-02 02:00 PM', 'u2', 'application/pdf', 'Toxicology_Report.pdf']
    ];
    for (const m of mediaItems) {
      await p.query(
        'INSERT INTO media (media_id, case_id, doc_type, scanned_copy, media_type, uploaded_at, uploaded_by, mime_type, original_filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        m
      );
    }

    await p.query('INSERT INTO reports_meta (id, case_id, type, status, date) VALUES (?, ?, ?, ?, ?)', ['rep1', '2026101', 'MLEF', 'Drafted', '2026-06-01']);
    await p.query('INSERT INTO reports_meta (id, case_id, type, status, date) VALUES (?, ?, ?, ?, ?)', ['rep2', '2026102', 'PMR', 'Pending Signature', '2026-06-02']);

    const logs = [
      ['log1', 'User Login', 'Dr. A. Perera', '2026-06-03 08:00 AM', 'Successful login via IP 192.168.1.1'],
      ['log2', 'Case Created', 'Data Entry Operator', '2026-06-03 08:15 AM', 'Created case #2026104'],
      ['log3', 'Evidence Uploaded', 'Dr. C. Fernando', '2026-06-03 08:45 AM', 'Uploaded 3 photos to case #2026104']
    ];
    for (const log of logs) {
      await p.query('INSERT INTO audit_logs (id, action, user_name, timestamp, details) VALUES (?, ?, ?, ?, ?)', log);
    }

    const defaultPasswordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'password123', 12);
    const users = [
      ['u1', 'Dr. A. Perera', 'Consultant JMO', 'perera@hospital.gov', defaultPasswordHash, 'p_doc1'],
      ['u2', 'Dr. B. Silva', 'Medical Officer', 'silva@hospital.gov', defaultPasswordHash, 'p_doc2'],
      ['u3', 'Dr. C. Fernando', 'Consultant JMO', 'fernando@hospital.gov', defaultPasswordHash, 'p_doc3'],
      ['u4', 'Data Entry Operator', 'Data Entry Operator', 'operator@hospital.gov', defaultPasswordHash, 'p_op1'],
      ['u5', 'System Administrator', 'System Administrator', 'admin@hospital.gov', defaultPasswordHash, 'p_admin1'],
      ['u6', 'Forensic Support Staff', 'Forensic Support Staff', 'staff@hospital.gov', defaultPasswordHash, 'p_staff1'],
      ['u7', 'Hospital Administrator', 'Hospital Administration', 'hospital-admin@hospital.gov', defaultPasswordHash, 'p_admin2']
    ];
    for (const user of users) {
      await p.query(
        'INSERT INTO users (id, name, role, email, password, person_id) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }

    console.log('Seeding main tables completed.');
  }

  // 2. Seed Summons independently to ensure they exist even if users table is already seeded
  const [sumRows] = await p.query('SELECT COUNT(*) as count FROM summon');
  if (sumRows[0].count === 0) {
    console.log('Seeding summons...');
    await p.query('INSERT INTO summon (summon_id, case_id, who_issued, court_date, date_of_issue) VALUES (?, ?, ?, ?, ?)', [
      'sum1', '2026101', 'High Court Kandy', '2026-06-25', '2026-06-01'
    ]);
    await p.query('INSERT INTO summon (summon_id, case_id, who_issued, court_date, date_of_issue) VALUES (?, ?, ?, ?, ?)', [
      'sum2', '2026102', 'Magistrate Court Peradeniya', '2026-06-30', '2026-06-02'
    ]);
    console.log('Seeding summons completed.');
  }
}
