/*
 Template Name: TimeLand
 File Name: custom.js
 Author Name: ThemeVault
 Author URI: http://www.themevault.net/
 License URI: http://www.themevault.net/license/
 */
jQuery(window).load(function () {
    $('#preloader-container').delay(750).fadeOut('slow');
});

$(document).ready(function () {
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('#back-to-top').fadeIn();
        } else {
            $('#back-to-top').fadeOut();
        }
    });
    $('#back-to-top').click(function () {
        $("html, body").animate({scrollTop: 0}, 600);
        return false;
    });

});

$(document).ready(function () {
    "use strict";
    if ($('.scrollReveal').length && !$('html.ie9').length) {
        $('.scrollReveal').parent().css('overflow', 'hidden');
        window.sr = ScrollReveal({
            reset: false,
            distance: '32px',
            mobile: true,
            duration: 850,
            scale: 1,
            viewFactor: 0.3,
            easing: 'ease-in-out'
        });
        sr.reveal('.sr-top', {origin: 'top'});
        sr.reveal('.sr-bottom', {origin: 'bottom'});
        sr.reveal('.sr-left', {origin: 'left'});
        sr.reveal('.sr-long-left', {origin: 'left', distance: '70px', duration: 1000});
        sr.reveal('.sr-right', {origin: 'right'});
        sr.reveal('.sr-scaleUp', {scale: '0.8'});
        sr.reveal('.sr-scaleDown', {scale: '1.15'});

        sr.reveal('.sr-delay-1', {delay: 200});
        sr.reveal('.sr-delay-2', {delay: 400});
        sr.reveal('.sr-delay-3', {delay: 600});
        sr.reveal('.sr-delay-4', {delay: 800});
        sr.reveal('.sr-delay-5', {delay: 1000});
        sr.reveal('.sr-delay-6', {delay: 1200});
        sr.reveal('.sr-delay-7', {delay: 1400});
        sr.reveal('.sr-delay-8', {delay: 1600});

        sr.reveal('.sr-ease-in-out-quad', {easing: 'cubic-bezier(0.455,  0.030, 0.515, 0.955)'});
        sr.reveal('.sr-ease-in-out-cubic', {easing: 'cubic-bezier(0.645,  0.045, 0.355, 1.000)'});
        sr.reveal('.sr-ease-in-out-quart', {easing: 'cubic-bezier(0.770,  0.000, 0.175, 1.000)'});
        sr.reveal('.sr-ease-in-out-quint', {easing: 'cubic-bezier(0.860,  0.000, 0.070, 1.000)'});
        sr.reveal('.sr-ease-in-out-sine', {easing: 'cubic-bezier(0.445,  0.050, 0.550, 0.950)'});
        sr.reveal('.sr-ease-in-out-expo', {easing: 'cubic-bezier(1.000,  0.000, 0.000, 1.000)'});
        sr.reveal('.sr-ease-in-out-circ', {easing: 'cubic-bezier(0.785,  0.135, 0.150, 0.860)'});
        sr.reveal('.sr-ease-in-out-back', {easing: 'cubic-bezier(0.680, -0.550, 0.265, 1.550)'});
    }
});
/*
madhya pradesh = "386ce542-8e39-4c4c-98e0-ddc28c2b5c56";
gujarat = 9ef84268-d588-465a-a308-a864a43d0070;
https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&fields=district&filters[state]=Gujarat
*/
$(document).ready(function(){
    $("#state").change(function(){
       var val = $("#state").val();
        var link = "https://api.data.gov.in/resource/386ce542-8e39-4c4c-98e0-ddc28c2b5c56?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&fields=district&";
        link += "filters[state]=" + val;
        $.ajax({url: link, success: function(result){
            console.log(result);
            var data = [];
            $(result['records']).each(function(i,item){
                data.push(item['district']);
            });
            
            var distr = Array.from(new Set(data));
            $("#district").html('');
            $(distr).each(function(i, item){
                $("#district").append("<option>"+item+"</option>");
            });
        }});
    })

    $("#form form").submit(function(e){
        e.preventDefault();
        var value = [];
        value['commodity'] = $("#commodity").val();
        value['state'] = $("#state").val();
        value['district'] = $("#district").val();
        value['date'] = $("#date").val();
        var link = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&offset=0&limit=1000&fields=min_price,max_price,commodity&";
        link += "filters[state]=" + value['state'];
        $.ajax({url: link, success: function(result){
            console.log(result);
            var data = "";
            $(result['records']).each(function(i,item){
                data += JSON.stringify(item);
            });
            $("#marq marquee").html(data);
        }});
    })

    $(".loginlink").click(function(){
        $("#loginform").toggle();
    })

    
    google.charts.load('current', {packages: ['corechart','bar']});
    google.charts.setOnLoadCallback(drawCharts);

    function drawCharts()
{
    barchart();
}

function barchart() {

    var data = google.visualization.arrayToDataTable([
      ['wheat', 'total'],
      ['16-03-2019', 1800],
      ['15-03-2019', 1845],
      ['14-03-2019', 1865],
      ['13-03-2019', 1800],
      ['12-03-2019', 1845],
      ['11-03-2019', 1865],
      ['10-03-2019', 1865],
    ]);

    var options = {
      title: "Total Bars",
      is3D: true,
      legend:'bottom',
      legendposition:'center',
      width:'100%',
      height:'100%',
      bars: 'vertical',
      chartArea: {
          left: "3%",
          top: "3%",
          height: "94%",
          width: "94%"
      },
      pieSliceText: 'value',
    };

    var bars = new google.charts.Bar(document.getElementById('bars'));
    google.visualization.events.addListener(bars, 'select', barsclick);
    
    bars.draw(data, options);

    function barsclick() {
        var selectedItem = bars.getSelection()[0];

        if (selectedItem) 
        {
          var topping = data.getValue(selectedItem.row, 0);
          alert('The user selected ' + topping);
        }
    }

}
})  

// function mailsend()
// {
//     $("#mailsendmsg").click(function(ev){
//     ev.preventDefault();  
//     if($(this).closest('form').valid()){
//         var data = $(this).closest('form').serialize();
//         $.ajax({
//             url:'/userright/mailsend',
//             method:'POST',
//             dataType: 'json',
//             data:data,
//             success: function(dat){
//                 console.log(dat);
//                 // alert(dat.success);
//                 if(dat.success == true){
//                     alert('khhhhh')
//                     $('#addparty').modal('hide');
//                     swal({
//                         title: "Party",
//                         text: "Party Saved",
//                         icon: "success",
//                         timer: 2000,
//                         buttons: false
//                         }) 
//                 }else{
//                     swal({
//                         title: "Party",
//                         text: "Party Not Saved, Please Try Again",
//                         icon: "error",
//                         timer: 2000,
//                         buttons: false
//                         }) 
//                 }
//             }
//         })
//     }
// })
// }
