const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Model buat fitur "Buku Tamu" (Bagian 2 - implementasi mandiri).
 * Sengaja dibikin simpel: nama + pesan, ditampilin lagi ke semua orang
 * yang buka halaman /guestbook - jadi tempat yang pas buat mbuktiin
 * ke-5 syarat keamanan (validasi, sanitasi, escape, parameterized query).
 */
const Comment = sequelize.define(
  'Comment',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(40), allowNull: false },
    message: { type: DataTypes.STRING(300), allowNull: false },
  },
  { tableName: 'comments', timestamps: true }
);

module.exports = Comment;
