$(document).ready(function(){
var stompClient;
   // conslole.log(stompClient);
    function connect() {
        var socket = new SockJS('http://worldchats.net/logsviewer/log');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function(frame) {
           //setConnected(true);
            console.log('Connected: ' + frame);

            //console.log(httpGet("http://worldchats.net/folders"));
            //TODO on getLogs press subscribe
           stompClient.subscribe('/log/TOMCAT', function(logs){
                  console.log(JSON.parse(logs.body).content)
              });
        });
    }
//connect();

    var data_now = new Date;//Установка сьогоднышньоъ дати
    var from_date = data_now.setDate( data_now.getDate() - 2 );//Брати 2 дня назад
    var d = new Date(data_now.getFullYear(), data_now.getMonth(), data_now.getDate());

    var formatDate= function(datee) {
        var dd = datee.getDate()
        if ( dd < 10 ) dd = '0' + dd;
        var mm = datee.getMonth()+1
        if ( mm < 10 ) mm = '0' + mm;
        var yyyy = datee.getFullYear();
        if ( yyyy < 10 ) yyyy = '0' + yyyy;
        m=(dd+'-'+mm+'-'+yyyy);
        return m;
    }
    $('#mydate').val(formatDate(d));

    $('#chdate').change(function() {
        if($(this).is(":checked")) {
            $("#mydate").removeAttr("disabled");
            $('#mydate').val("");
            }
        else {
           $('#mydate').val(formatDate(d));
            $("#mydate").attr("disabled","disabled");
        }


    });


    $("#mydate").datepicker({
          });

    /*------запит на каталоги----------*/
    var getReqFolder=function(){

         $.ajax({
            url:'http://worldchats.net/logsviewer/folders',
            type:'GET',
            dataType: "json",
            contentType: "application/json",
            success:function(data){
                folderLoad(data);
            },
            error:    function(){
                alert('error!');
            }
        });


    };
    /*--------------------------*/
    getReqFolder();
    /*------Запит на список файлыв------*/
    var getReqFile = function(folder,date){

        $.ajax({
            url:'http://worldchats.net/logsviewer/folder/'+folder+'/from/'+date,
            type:'GET',
            success:  function(data){
                stopLoadingAnimation();
                goFile(data);
                Log(data);
                //console.log(date);
            },
            error:function()
            {
                alert('error!');
            }

        });
    };
    /*---------------------------------*/

    var scrollUp = function(){
        var height=$(document).height();
        $("body").animate({"scrollTop":height},"slow");
    };

    $('#file_hiden, #default').addClass('hidden');

    function startLoadingAnimation()
    {

        var imgObj = $(".loader");
        var back = $('.back_load');
        back.show();
        imgObj.show();

        var centerY = $(window).scrollTop() + ($(window).height() + imgObj.height())/2;
        var centerX = $(window).scrollLeft() + ($(window).width() + imgObj.width())/2;

        imgObj.offset({top:centerY, left:centerX});

    }
    function stopLoadingAnimation() {

        $(".loader").hide();
        $('.back_load').hide();
    }

    /*-------Загрузка каталогів---------*/
    var folderLoad=function(data){

        for (var i=0; i<data.length;i++){
        $('#folder_group').append('<a href="#" class="btn btn-default">'+data[i]+'</a>');
        }
            $('#folder_group a').click(function(){
             startLoadingAnimation();
                $('#file_name').addClass('hidden');
                $('#date_file').addClass('hidden');
                $('#ch_file').addClass('hidden');
             $('#file_name').addClass('hidden');
             $('#default').empty();
             $('#list_file').empty();
             $('#logs').text("Load logs...");
             $('#file_name').text("");
             var folder = $(this).text();
                if($('#chdate').is(":checked")) {
                      $("#mydate").removeAttr("disabled");
                      $(this).attr("checked");
                      var date_choice = $('#mydate').val();
                      var date = new Date(Date.parse(date_choice));
                      var x = formatDate(date);
                      getReqFile(folder,x);
                  }
                else {
                    $("#mydate").attr("disabled","disabled");
                    x = formatDate(d);
                   getReqFile(folder,x);
                }
             $('#file_hiden').removeClass('hidden');
        })
    }   /*-------------------------------------*/

    /*-------------ЗАГРУЗКА ФАЙЛІВ--------------*/
       var goFile = function(data){
           for (var i=0; i<data.length;i++){
            $('#list_file').append('<a href="#" class="list-group-item">'+data[i].fileName+'</a>');
        }
    };
    /*-------------------------------------*/

    /*-------Загрузка логів----------------*/
   var Log = function(data){
       $('#list_file>a').click(function()
       {
           for(var j=0; j<data.length;j++)
           {
           if ($(this).text() == data[j].fileName)
           {
               $('#file_name').removeClass('hidden');
               $('#date_file').removeClass('hidden');
               $('#ch_file').removeClass('hidden');
               $('#file_name').html('<span class="mark"> This File </span>'+data[j].fileName);
               var dat = new Date(Date.parse(data[j].createdOn));
               var dd = new Date(dat.getFullYear(), dat.getMonth(), dat.getDate());
               $('#date_file').html('<span class="mark"> File created </span>'+formatDate(dd)+'<span class="mark"> Time  </span>'+dat.getHours()+':'+dat.getMinutes());
               var dat1 = new Date(Date.parse(data[j].modyfiedOn));
               var dd1 = new Date(dat1.getFullYear(), dat1.getMonth(), dat1.getDate());
               $('#ch_file').html('<span class="mark"> File modyfied </span>'+formatDate(dd1)+'<span class="mark"> Time  </span>'+dat1.getHours()+':'+dat1.getMinutes());

               var log = data[j].content;
               if(log!==null){
                   var ss=log.split(/$/m);
                   $('#default').empty();
                   $('#default').removeClass('hidden');
                   for(var z=0; z<ss.length;z++)
                   {
                       $('#default').append('<pre>'+ss[z]+'</pre>');

                   }
                   $('#default').height($(window).height());
                                  }
               else  if(log===null)
               {
                   $('#default').empty();
                   $('#default').append('<pre>'+log+'</pre>');
                   $('#default').height($(window).height());
               };
               $('#default').removeClass('hidden');
               $('#list_file').toggle("slow");
               $('pre').hover(
                   function(){
                       $(this).toggleClass('hilight');
                   },
                   function(){
                       $(this).toggleClass('hilight');
                   });

           }
       }
       var height=$(document).height();
       $("body").animate({"scrollTop":height});
        })
   };

    /*--------------------------------------*/

    $('.up').click( function(){
        window.scroll(0 ,0);
        return false;
    });

    $(window).scroll(function(){
        if ( $(document).scrollTop() > 0 ) {
            $('.up').fadeIn('fast');
        } else {
            $('.up').fadeOut('fast');
        }
    });


    $('#connect').attr("disabled","disabled");
    $('#disconnect').removeAttr("disabled");

    $('#refresh').click(function(){
        $('#folder_group').empty();
        getReqFolder();
        $('#file_name').addClass('hidden');
        $('#date_file').addClass('hidden');
  $('#ch_file').addClass('hidden');

    });

    $('.up').click(function(){
        $("body, html").animate({
            scrollTop: 0
        }, 800);
        return false;
        $('.up').toggle("slow");
    });

    $('#connect').click(function(){
        $('#folder_group').css("display","table");
        $('#connect').attr("disabled","disabled");
        $('#disconnect').removeAttr("disabled");
        $('#refresh').removeAttr("disabled");
        getReqFolder();
    });

    $('#default').dblclick(function(){
        $("body").animate({"scrollTop":0});
    });

    $('#disconnect').click(function(){
        $('#folder_group').css("display","none");
        $('#connect').removeAttr("disabled");
        $('#disconnect').attr("disabled","disabled");
        $('#refresh').attr("disabled","disabled");
        $('.menu>h4').css("display","none");
        $('#folder_group').empty();
        $('#list_file').empty();
        $('#file_hiden, #default').addClass('hidden');
        $('#file_name').text("");
        $('#file_name').addClass('hidden');
        $('#date_file').addClass('hidden');
        $('#ch_file').addClass('hidden');
    });
    $('#list_file>a').click(function(){
        $(this).css("display","inline-block");
    });
    //----------------------------------------------------------------------------
    $('.list').click(function(){
        $('#list_file').toggle("slow");
    });

});
