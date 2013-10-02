var url = 'http://localhost/wiki/api.php?action';
var obj;


$(document).ready(function ()
{
    var tbl;
    var rowcount;
    //alert($().jquery);

    var token;
    var qry = '=query&prop=info%7Crevisions&intoken=edit&titles=Main_Page';
    $.getJSON(url + qry + '&format=json', function (data)
    {

        $.each(data.query.pages, function (key, val)
        {
            token = data.query.pages[key].edittoken.slice(0, data.query.pages[key].edittoken.length - 2) + '%2B%5C';
        });

    });


    $('#files').bind('change', handleFileSelect);
    $('#btnPreview').click(function ()
    {
        rowcount = processFile(obj);
    });
    $('#btnUpload').click(function ()
    {
        var page = $('#page').val();
        processFile2(obj, token, page, rowcount);
    });
    $('#btnClear').click(function ()
    {
        window.location.reload();
    });

});

function processFile(data){

    var html='<table>';
    var firstRow=true;
    var rowcount = 0;
    for (var row in data)
    {
  
          if(data[row][0]!='')
          {
             rowcount++;  
             var rowcountr = rowcount.toString(); 
             if(firstRow)
             {
                html += '<tr style="background-color:royalblue;color:white">';
                firstRow=false;   
             }
             else if(data[row][0]!='' && data[row][1]=='' && data[row][2]=='')
             {

                 html += '<tr style="background-color:deepskyblue;">';
             }
             else
             {
                html += '<tr>';    
             }
          
             html += processRow(row, data) + '</tr>';
             
           }
                
    }

    $('#content').append('<table class="table">' + html+'</table>');
    return rowcount;
    
}

function processFile2(data, token, page, rowcnt){

    var html ='<table class="wikitable">';
    var firstRow=true;
    var rowcountr = 0;
    for (var row in data)
    {
  
          if(data[row][0]!='')
          {

             rowcountr++;
             if(firstRow)
             {
                html += '<tr style="background-color:royalblue;color:white">';
                html += processRow(row, data) + '</tr>';
                firstRow=false; 
             }                                      
             else if(data[row][0]!='' && data[row][1]=='' && data[row][2]=='')
             {
                   
                 
                if(rowcountr>4)
                {
                    var tbl = html;
                    html = '';
                    uploadTable(obj, tbl, page, token, rowcnt, rowcountr);     
                } 
                
                html += '<tr style="background-color:deepskyblue;">' +
                        processRow(row, data) + '</tr>';  
                 
                        
             }
             else if(rowcnt == rowcountr)
             {
                uploadTable(obj, tbl, page, token, rowcnt, rowcountr);      
             }
             
             else
            
             {
                html += '<tr>';  
                html += processRow(row, data) + '</tr>'; 
                      
             }
    
         }

    }

}

function processRow(row, data){
    
    var html='';
    for (var item in data[row]){

        var txt = data[row][item];    
        html += formatCell(txt);
   
    }

    return html;
    
}

function replaceTxt(txt){
   txt = txt.replace("SuMo:","<br><b>SuMo:</b> ");
   txt = txt.replace("DC:","<br><b>DC:</b> "); 
   txt = txt.replace("On-going:","<br><b>On-going:</b> ");
   txt = txt.replace("Support issues:","<br><b>Support issues</b>: ");
   txt = txt.replace("FAM:","<br><b>FAM</b>: ");
   txt = txt.replace("Deployment:","<br><b>Deployment</b>: ");
   
   if (txt.slice(0, 4) == '<br>')
   {
       txt = txt.slice(4, txt.length); 
   }

   return txt;
} 

function formatCell(txt){

    var html = '';

    txt = replaceTxt(txt);
    
    if (txt.slice(0, 2) == 'NO'||txt.slice(0, 2) == '??'||
            txt.slice(0, 3)=='2.2'||txt.slice(0, 3)=='3.2'||
            txt.slice(0, 3)=='3.1'||txt.slice(0, 3)=='3.2'||
            txt.slice(0, 3)=='3.5'||txt.slice(0, 3)=='3.7')
    {
        html += '<td style="background-color:red;">' + txt + '</td>';           
    }
    else if (txt.slice(0,4)=='2.41'||txt.slice(0,4)=='2.35')
    {
        html += '<td style="color:green;">' + txt + '</td>';  
    }
                
    else if (txt.slice(0,4)=='ND')
    {
        html += '<td style="background-color:gainsboro;"></td>';
    }
    else if (txt.slice(0, 3) == 'Not')
    {
        html += '<td style="background-color:yellow;">' + txt + '</td>';
    }
    else
    {
        html += '<td>' + txt + '</td>';
    }
    
    return html;    
}


function handleFileSelect(evt) {
  $('#content').html('');
  var files = evt.target.files;
  var file = files[0];
  $('#btnUpload').show(); 
  createReader(file);
  
  var control = L.Control.fileLayerLoad();
    control.loader.on('data:loaded', function (e) {
        // Add to map layer switcher
        layerswitcher.addOverlay(e.layer, e.filename);
    });
              
}

function createReader(file){

  var reader = new FileReader();
  reader.readAsText(file);
  var template = $('#template').val();

  reader.onload = function (event)
  {
      var csv = event.target.result;
      var data = $.csv.toArrays(csv);
      obj = data;
  };
  reader.onerror = function(){ 
    alert('Unable to read ' + file.fileName); 
  };   

}

function uploadTable(obj, tbl, page, token, rowcnt, rowcountr)
{
      
    if(rowcnt == rowcountr)
    {
        tbl+= '</table>';                   
    }
  
    //tbl = sanitizeTxt('%0D %0D==Test==%0D %0D' + tbl);
    tbl = sanitizeTxt(tbl);
    wiki_PostTbl(url, page, tbl, token, rowcnt, rowcountr);  

}

function sanitizeTxt(txt){

    txt = txt.replace(/\<tbody\>/g, "");
    txt = txt.replace(/\<\/tbody\>/g, "");
    txt = txt.replace(/=/g, "%3D");
    txt = txt.replace(/\#/g, "%23");
    txt = txt.replace(/\&/g,"%26");
    return txt;
    
}


function wiki_PostTbl(url, title, txt, token, rowcnt, rowcountr){

    var qry = '=edit&title=' + 
      title + '&appendtext=' +  txt + '&token='+
      token+'&format=json';

    $.ajax({
        url: url + qry,
        type: 'POST',
        async: false,
        success: function (data)
        {
            if (data && data.edit && data.edit.result == 'Success')
            {
                $("#log").append(rowcnt + ":" + rowcountr + '\n');
                console.log(rowcnt + ":" + rowcountr);
                if (rowcnt == rowcountr)
                {
                    $("#content").html('<iframe src="http://localhost/wiki/index.php?title='
                            + title + '" style="height: 800px; width: 100%;"></iframe>');
                    alert('Done');
                }
                
            }
        },
        error: function (xhr)
        {
            alert('Error: Request failed.');
        }
    });

 
}







