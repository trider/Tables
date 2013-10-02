$(document).ready(function(){
    //wiki_auth('jgold', 'meanmach', url);
    //wiki_qry('http://localhost/wiki/api.php?action=','query&list=allpages&apnamespace=117&aplimit=10');
    //wiki_view('http://localhost/wiki/api.php?action=','query&list=allpages&apnamespace=117&aplimit=5');
    wiki_parse('http://localhost/wiki/index.php?title=BMail_App&action=render');
    //wiki_getToken('http://localhost/wiki/api.php?action', '=query&prop=info%7Crevisions&intoken=edit&titles=Test');
    //wiki_getPageID('http://localhost/wiki/api.php?action', '=query&list=allpages&apfrom=Test&aplimit=1');
    //wiki_clean('http://localhost/wiki/api.php?action', '=query&prop=info%7Crevisions&intoken=edit&titles=Test');
    //wiki_edit('http://localhost/wiki/api.php?action', '=query&prop=info%7Crevisions&intoken=edit&titles=Test');
    wiki_search('http://localhost/wiki/api.php?action', '=opensearch&search=a&limit=10&namespace=117');
    
 
});

function wiki_auth(login, pass, url){
    $.post(url + 'login&lgname=' + login + 
            '&lgpassword=' + pass + '&format=json', function(data) {
        if(data.login.result == 'Success') {
          $('#txt').html('<p>Result: ' + data.login.result+'<p>');
          console.log('Result: ' + data.login.result);
        }
    });
}

function wiki_qry(url,qry){
    $.post(url + qry + '&format=json', function(data) { 
      for ( i=0; i < data.query.allpages.length; i++) {
        $('#txt').append('<p>'+ 
          'Item: ' +  i + ', ' +
          'ID: ' + data.query.allpages[i].pageid + ', ' +
          'NS: ' + data.query.allpages[i].ns + ', ' +
          'Title: ' + data.query.allpages[i].title +'<p>');
      } 
    });
}

function wiki_search(url,qry){

    $.getJSON(url + qry+ '&format=json', function(data) {
     
      $.each(data[1], function(key,val) {
         //$('#txt').append('<br>'+ key + ': ', val);
          $('#txt').append('<br>'+ val);
      });
    });
   
}

function wiki_view(url,qry){
    
  $.post(url + qry + '&format=json', function(data){
    
    for (i=0; i < data.query.allpages.length; i++) {
          var title = data.query.allpages[i].title;
          var parse_url = "http://localhost/wiki/index.php?title=" + title + '&action=raw';      
          //wiki_txt(parse_url+'&section=1', title, 'Description', '==');      
          //wiki_txt(parse_url+'&section=2', title, 'Acronym', '==');
          //wiki_txt(parse_url+'&section=3', title, 'Synonym', '==');
          //wiki_txt(parse_url+'&section=4', title, 'Related Terms', '==');
          //wiki_txt(parse_url+'&section=5', title, 'Related Articles', '==');
          //wiki_txt(parse_url+'&section=6', title, 'Related Documents', '==');
          //wiki_txt(parse_url+'&section=7', title, 'Usage and Pronunciation', '==');
          //wiki_txt(parse_url+'&section=8', title, 'Context', '=='); 
    } 
      
  });
      
}

function wiki_parse(url){

    $.post(url, function(data) {
          $('#txt').append(data);
    });
}

function wiki_txt(url, title, sec, symb){

  $.post(url, function(data) {
      
      var txt_url = 'http://localhost/wiki/api.php?action=parse&text='+data+'&prop=text&format=json';
      
      $.post(txt_url, function(data) {
        var txt = data.parse.text['*'];
        var loc = txt.indexOf('==', sec.length)+symb.length;
        var loc2 = txt.indexOf('\n');
        
        if(sec=='Description'){
          $('#txt').append('<h2>' + title + '</h2>');
          $('#txt').append(txt.slice(loc, loc2)); 
        }
        else{
          $('#txt').append('<h3>' + sec + '</h3>');
          $('#txt').append(txt.slice(loc, loc2)); 
        }
        
    });
  });
}

function wiki_getToken(url, qry) {
  $.getJSON(url + qry+ '&format=json', function(data) {
      $.each(data.query.pages, function(key, val) {
           var token = data.query.pages[key].edittoken.slice(0, data.query.pages[key].edittoken.length-2 )+'%2B%5C';
           $('#txt').append(token);          
      });
    });
  
}


function wiki_getPageID(url, qry) {

  $.post(url + qry+ '&format=json', function(data) { 
       $('#txt').append('<hr>'+JSON.stringify(data));
       $('#txt').append('<hr>'+data.query.allpages[0].pageid);
  });
  
  $.getJSON(url + qry+ '&format=json', function(data) {
    
    var lst = data.query.allpages[0];
   
    $.each(lst, function(key, val) {
       $('#txt').append('<br>'+ key + ':', val);
    });
   
    
  });
  

  
}

function wiki_edit(url, qry) {

    $.post(url + '=query&list=allpages&apfrom=Test&aplimit=1'+ '&format=json', function(data) { 
      var id = data.query.allpages[0].pageid;
      $.post(url + qry+ '&format=json', function(data) { 
           var token = data.query.pages[id].edittoken.slice(0, data.query.pages[id].edittoken.length-2 )+'%2B%5C';
           $.post(url+'=edit&title=Test&section=new&summary=test&text=Hello world&token='+token+'&format=json', function(data) { 
            if ( data.edit.result == 'Success' ) {
                   wiki_parse('http://localhost/wiki/index.php?title=Test&action=render'); 
                
            }
        });        
      });
    });  
}

function wiki_clean(url, qry) {

    $.post(url + '=query&list=allpages&apfrom=Test&aplimit=1'+ '&format=json', function(data) { 
      var id = data.query.allpages[0].pageid;
      $.post(url + qry+ '&format=json', function(data) { 
           var token = data.query.pages[id].edittoken.slice(0, data.query.pages[id].edittoken.length-2 )+'%2B%5C';
           $.post(url+'=edit&title=Test&text=&token='+token+'&format=json', function(data) { 
            if ( data.edit.result == 'Success' ) {
                   wiki_parse('http://localhost/wiki/index.php?title=Test&action=render'); 
                
            }
        });        
      });
    });

  
}



