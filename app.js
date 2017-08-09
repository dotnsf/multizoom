
var express = require( 'express' ),
//    basicAuth = require( 'basic-auth-connect' ),
    cfenv = require( 'cfenv' ),
    easyimg = require( 'easyimage' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    watson = require( 'watson-developer-cloud' ),
    app = express();
var settings = require( './settings' );
var vr3 = watson.visual_recognition({
  api_key: settings.vr_apikey,
  version: 'v3',
  version_date: '2016-05-19'
});
var appEnv = cfenv.getAppEnv();

app.use( multer( { dest: './tmp/' } ).single( 'image' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.Router() );
app.use( express.static( __dirname + '/public' ) );

app.get( '/multizoom', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/multizoom.ejs', 'utf-8' );

  var p = ejs.render( template, {} );
  res.write( p );
  res.end();
});

app.get( '/checkimage', function( req, res ){
  var filename = req.query.filename;
  var left = req.query.left;
  var top = req.query.top;
  var width = req.query.width;
  var height = req.query.height;
  //console.log( '(' + left + ',' + top + ')-[' + width + ',' + height + ']' );

  var srcpath = 'public/' + filename;
  var dstpath = 'public/' + filename + '.png';
  var settingObj = {
    format: 'png',
    src: srcpath,
    dst: dstpath,
    x: left,
    y: top,
    cropwidth: width,
    cropheight: height
  };
  easyimg.crop( settingObj ).then( function( image ){
/*
    var stream = fs.createReadStream( image.path, {} );
    stream.on( 'data', function( data ){
      var params = { images_file: data };
      var req1 = vr3.classify( params, function( err1, res1 ){
        if( err1 ){
          console.log( err1 );
          res.write( JSON.stringify( err1 ) );
          res.end();
        }else{
          res.write( JSON.stringify( res1, null, 2 ) );
          res.end();
        } 

        fs.unlink( dstpath, function( err0 ){} );
      });
    });

    stream.on( 'end', function(){
    });
*/
    var params = {
      images_file: fs.createReadStream( dstpath )
    };
    var req1 = vr3.classify( params, function( err1, res1 ){
      if( err1 ){
        console.log( err1 );
        res.write( JSON.stringify( err1 ) );
        res.end();
      }else{
        res.write( JSON.stringify( res1, null, 2 ) );
        res.end();
      } 

      fs.unlink( dstpath, function( err0 ){} );
    });
  });
});


app.listen( appEnv.port );
console.log( "server stating on " + appEnv.port + " ..." );

