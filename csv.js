var url = 'http://localhost/wiki/api.php?action';
//var url = 'http://ilwiki1-dev/api.php?action';
//var url = 'http://ndpedia.nds.com//api.php?action';
var obj;  

$(document).ready(function() {
   // $('#btnUpload').hide();
    $('#files').bind('change', handleFileSelect); 
    $('#btnUpload').click(function(){
      $('#contents').html('');
      getToken(url, '=query&prop=info%7Crevisions&intoken=edit&titles=Main_Page', obj);
      //$('#btnUpload').hide();
    }); 
});


function handleFileSelect(evt) {
  var files = evt.target.files;
  var file = files[0];
  //$('#btnUpload').show(); 
  createReader(file);   
  getFileMetadata(file);            
}

function createReader(file){

  var reader = new FileReader();
  reader.readAsText(file);
  var template = $('#template').val();
  reader.onload = function(event){
    var csv = event.target.result;
    var data = $.csv.toArrays(csv);
    getFileMetadata(file);
    populateLst(url, '=query&list=allpages&apnamespace=10&&apfrom=Dict_Meta&aplimit=5');
    obj = data;  
  };
  reader.onerror = function(){ 
    alert('Unable to read ' + file.fileName); 
  };   


}


function getFileMetadata(file){
  
  $('#contents').html('');
  $('#list').html('');
  
  var output =  ' - FileSize: ' + file.size + ' bytes\n';
      output += ' - LastModified: ' + (file.lastModifiedDate ? 
        file.lastModifiedDate.toLocaleDateString() : 'n/a') + '\n';
      
  $('#list').append(output);
  
} 

function populateLst(url,qry){

    $('#template').html('');
    var num;

    $.getJSON(url + qry + '&format=json', function (data)
    {

        for (i = 0; i < data.query.allpages.length; i++)
        {
          $('#template').append('<option value="' +
          data.query.allpages[i].title + '">' +
          data.query.allpages[i].title + '</option>');
        }
    });
  
}

function getToken(url, qry, obj){

  $.getJSON(url + qry+ '&format=json', function(data) {
    $.each(data.query.pages, function(key, val) {
        var token = data.query.pages[key].edittoken.slice(0, data.query.pages[key].edittoken.length-2 )+'%2B%5C';
        processFile(url, token, obj);     
      });
  });
}

function processFile(url, token, data){

  $("#contents").append('Upload started\n----\nCreating and formatting terms\n----\n'); 
  var template = $('#template').val();
  var prefix = 'Template:'
  template = template.slice(prefix.length);
  for(var row in data) {
    var title = 'TERM:' + data[row][0] + 
      ' ('+ data[row][1] + ')';        
    var txt = data[row][2];
           
     if(data[row][0]!='Term'){
         wiki_Clear(url, title, txt, token, template);
     }
     
  }
  
}


function wiki_Clear(url, title, txt, token, template){
    
  var qry = '=edit&title=' +  title + '&text={{subst:Dict_Meta}}' +
     '&token='+token+'&format=json';

  $.post(url+qry, function(data) { 
     if ( data.edit.result == 'Success' ) {
	    wiki_Post(url, title, txt, token, template);
      }
   });    
}


function wiki_Post(url, title, txt, token, template){
      
   var qry = '=edit&title=' + 
      title + '&section=new&summary=Description&text=' +  
      txt + '{{subst:'+template+'}}&token='+
      token+'&format=json';
        
  var d=new Date();
  var output='';
  
  $.post(url+qry, function(data) { 
      if (data.edit.result == 'Success' ) {
        console.log(title + ' content uploaded');
        output+=title +' uploaded\n';
      }
      else{
        console.log(title + ' upload error');
      }
      
      $("#contents").append(output); 
      
  }); 
    
}