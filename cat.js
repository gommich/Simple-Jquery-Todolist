var express = require ('express');
var path = require('path');
var PORT = process.env.PORT||8080;

const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const client = pool.connect()
  .then(client.query('create table todo (id serial primary key, item varchar(255))'))
  .then(console.log("hooray"));
