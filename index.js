var express = require ('express');
var path = require('path');
var bodyParser = require('body-parser');
var PORT = process.env.PORT||8080;

const {Pool} = require('pg');
const pool = new Pool({
  connectionString: 'postgres://yizprgqhdmoqrv:7a3b1854224e73f2387a8acce8aeb06b3532369d9aabb3d85d101794171184e8@ec2-54-217-205-90.eu-west-1.compute.amazonaws.com:5432/dd5ja9d01n2umb',
  ssl: true
});

// app instantiation and middlewares
var app=express();
app.use( express.static( __dirname + '/client' ));
app.use(bodyParser.json())



// Adds a todo-list item
app.post('/addtodo', async (req,res)=>{
  var item = req.body.item
  var status = req.body.status

  try{
    const client = await pool.connect()
    var result = await client.query(`insert into todo (item,status) values ('${item}','${status}') RETURNING id`);

    //ID of the post so can be deleted if necessary later
    currID=result.rows[0].id
    //Send ID back to front end
    res.setHeader('Content-Type', 'application/json');
    res.send(result.command+" "+item+" "+status+"\n");

    client.release();
    } catch (err) {
      console.error(err)
      res.send("Error"+ err);
    }
});

// Removes a todolist item
app.put('/deletetodo', async (req,res)=>{
  var item = req.body.item
  try{
    const client = await pool.connect()
    var result = await client.query(`DELETE FROM todo where item = '${item}'`);
    res.send(result.command+" "+item+"\n");

    client.release();
    } catch (err) {
      console.error(err)
      res.send("Error"+ err);
    }
});

// Updates a todo list item value (REPLACES)
app.put('/updatetodo', async (req,res)=>{
  var olditem = req.body.olditem;
  var newitem = req.body.newitem;
  try{
    const client = await pool.connect()
    var result = await client.query(`UPDATE todo SET item='${newitem}' where item='${olditem}'`);

    res.send(result.command+" "+olditem+" "+newitem+"\n");


    client.release();
    } catch (err) {
      console.error(err)
      res.send("Error"+ err);
    }
});

// Update STATUS of an active todo list item to be completed.
app.put('/update-status-to-completed', async (req,res)=>{
  var item = req.body.item
  try{
    const client = await pool.connect()
    var result = await client.query(`UPDATE todo SET status='completed' where item='${item}'`);
    res.send(result.command+" "+item+" "+"completed\n");


    client.release();
    } catch (err) {
      console.error(err)
      res.send("Error"+ err);
    }
});

// Update STATUS of a completed todolist item to be active.
app.put('/update-status-to-active', async (req,res)=>{
  var item = req.body.item
  try{
    const client = await pool.connect()
    var result = await client.query(`UPDATE todo SET status='active' where item='${item}'`);
    res.send(result.command+" "+item+" "+"active\n");


    client.release();
    } catch (err) {
      console.error(err)
      res.send("Error"+ err);
    }
});

//fetches the entire db to render to screen
app.get('/db', async (req,res)=>{
  try{
    const client = await pool.connect()
    var result = await client.query('SELECT * FROM todo');

    if(!result){
      return res.send("No data found");
    }else{
      res.send(result.rows);
    }

    client.release();
  } catch (err) {
    console.error(err)
    res.send("Error"+ err);
  }
});

// Serve html, css and js at root
app.get('/', (req, res) =>{
  res.sendFile( path.join( __dirname, 'client', 'index.html' ))
}).listen(PORT, () => console.log('Listening on',PORT))
