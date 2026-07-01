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
      status VARCHAR(30) NOT NULL DEFAULT 'Active',
      must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
      password_updated_at DATETIME,
      last_password_reset_at DATETIME,
      temporary_password_expires_at DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deactivated_at DATETIME,
      FOREIGN KEY (person_id) REFERENCES person(person_id) ON DELETE SET NULL
    )
  `);

  await ensureColumn(p, 'users', 'status', "VARCHAR(30) NOT NULL DEFAULT 'Active'");
  await ensureColumn(p, 'users', 'must_change_password', 'BOOLEAN NOT NULL DEFAULT FALSE');
  await ensureColumn(p, 'users', 'password_updated_at', 'DATETIME');
  await ensureColumn(p, 'users', 'last_password_reset_at', 'DATETIME');
  await ensureColumn(p, 'users', 'temporary_password_expires_at', 'DATETIME');
  await ensureColumn(p, 'users', 'created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn(p, 'users', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await ensureColumn(p, 'users', 'deactivated_at', 'DATETIME');

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

  if (process.env.CLEAN_DEMO_DATA_ON_START === 'true') {
    await removeKnownDemoData(p);
  }

  const [rows] = await p.query('SELECT COUNT(*) as count FROM users');
  if (rows[0].count === 0) {
    console.log('No users found. Creating bootstrap System Administrator only...');

    const adminPassword = process.env.SEED_USER_PASSWORD || 'ChangeMe123!';
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@hospital.gov';
    const adminName = process.env.SEED_ADMIN_NAME || 'System Administrator';
    const defaultPasswordHash = await bcrypt.hash(adminPassword, 12);

    await p.query(
      `INSERT INTO users
        (id, name, role, email, password, person_id, status, must_change_password, password_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Active', ?, NOW())`,
      ['u_admin', adminName, 'System Administrator', adminEmail, defaultPasswordHash, null, true]
    );

    console.log(`Bootstrap System Administrator created: ${adminEmail}`);
  }
}

async function removeKnownDemoData(pool) {
  console.log('Cleaning known demo data IDs...');

  await pool.query("DELETE FROM audit_logs WHERE id IN ('log1', 'log2', 'log3')");
  await pool.query("DELETE FROM reports_meta WHERE id IN ('rep1', 'rep2')");
  await pool.query("DELETE FROM media WHERE media_id IN ('ev1', 'ev2', 'ev3')");
  await pool.query("DELETE FROM summon WHERE summon_id IN ('sum1', 'sum2')");
  await pool.query("DELETE FROM pmr WHERE pmr_id IN ('pm1')");
  await pool.query("DELETE FROM mlef WHERE mlef_id IN ('m1', 'm2')");
  await pool.query("DELETE FROM clinical_record WHERE clinical_id IN ('cl1', 'cl2')");
  await pool.query("DELETE FROM investigation_cases WHERE case_id IN ('2026101', '2026102', '2026103', '2026104')");
  await pool.query("DELETE FROM decedent WHERE decedent_id IN ('dec1', 'dec2')");
  await pool.query("DELETE FROM patient WHERE person_id IN ('p_pat1', 'p_pat2')");
  await pool.query("DELETE FROM jmo WHERE person_id IN ('p_doc1', 'p_doc3')");
  await pool.query("DELETE FROM mo WHERE person_id IN ('p_doc2')");
  await pool.query("DELETE FROM police WHERE person_id IN ('p_pol1', 'p_pol2')");
  await pool.query("DELETE FROM users WHERE id IN ('u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7')");
  await pool.query(`
    DELETE FROM person
    WHERE person_id IN (
      'p_doc1', 'p_doc2', 'p_doc3', 'p_op1', 'p_admin1', 'p_staff1', 'p_admin2',
      'p_pat1', 'p_pat2', 'p_pol1', 'p_pol2'
    )
  `);

  console.log('Known demo data cleanup completed.');
}
