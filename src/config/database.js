module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'tiago@123',
    database: process.env.DB_NAME || 'brain',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    define: {
      timestamps: true,
      underscored: true
    }
  }
}
