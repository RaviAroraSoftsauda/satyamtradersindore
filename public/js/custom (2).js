$(document).ready(function () {


	if (jQuery().datepicker) {
		$('.birth-date').datepicker({
			rtl: App.isRTL(),
			orientation: "left",
			autoclose: true,
			startView: "decade",
			format: "dd/mm/yyyy",
			endDate: "-30m"
		});
		$('.date').datepicker({
			rtl: App.isRTL(),
			orientation: "left",
			autoclose: true,
			format: "dd/mm/yyyy"
		});
		//$('body').removeClass("modal-open"); // fix bug when inline picker is used in modal
	}


	var placeholder = "Please Select";

	$(".select").select2({
		placeholder: placeholder,
		width: null
	});

	$(".select-multiple").select2({
		placeholder: placeholder,
		width: null,
		multiple: true
	});


	$('#datatable tfoot th').not('.excludesearch').each(function () {
		var title = $(this).text();
		$(this).html('<input type="text" class="form-control" placeholder="Search ' + title + '" />');
	});


	var table = $('#datatable');

	// begin first table
	table.DataTable({

		// Internationalisation. For more info refer to http://datatables.net/manual/i18n
		"language": {
			"aria": {
				"sortAscending": ": activate to sort column ascending",
				"sortDescending": ": activate to sort column descending"
			},
			"emptyTable": "No data available in table",
			"info": "Showing _START_ to _END_ of _TOTAL_ records",
			"infoEmpty": "No records found",
			"infoFiltered": "(filtered from _MAX_ total records)",
			"lengthMenu": "Show _MENU_",
			"search": "Search:",
			"zeroRecords": "No matching records found",
			"paginate": {
				"previous": "Prev",
				"next": "Next",
				"last": "Last",
				"first": "First"
			}
		},

		// Or you can use remote translation file
		//"language": {
		//   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
		//},

		// Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
		// setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js). 
		// So when dropdowns used the scrollable div should be removed. 
		// "dom": "<'row' <'col-md-12'>><'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r><'table-scrollable't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>", // horizobtal scrollable datatable
		//    "dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",

		"bStateSave": false, // save datatable state(pagination, sort, etc) in cookie.

		"lengthMenu": [
			[5, 15, 20, -1],
			[5, 15, 20, "All"] // change per page values here
		],

		// set the initial value
		"pageLength": 20,
		"pagingType": "bootstrap_full_number",
		"columnDefs": [{ // set default column settings
				'orderable': false,
				'targets': [0]
			},
			{
				"searchable": false,
				"targets": [0]
			},
			{
				"className": "dt-right",
				//"targets": [2]
			}
		],
		"order": [
			[0, "asc"]
		], // set first column as a default sort by asc

		initComplete: function () {

			// username column
			this.api().column(".status").every(function () {
				var column = this;
				var select = $('<select class="form-control input-sm"><option value="">Show All</option></select>')
					.appendTo($(column.footer()).empty())
					.on('change', function () {
						var val = $.fn.dataTable.util.escapeRegex(
							$(this).val()
						);
						column
							.search(val, true, false, false)
							.draw();
					});

				column.data().unique().sort().each(function (d, j) {
					var v = /(?=>?)[A-Z][a-z]+(?=<?)/g.exec(d);
					select.append('<option value="' + v + '">' + v + '</option>')
				});
			});
			// Apply the search
			this.api().columns().every(function () {
				var that = this;

				$('input', this.footer()).on('keyup change', function () {
					console.log('triggered');
					if (that.search() !== this.value) {
						that
							.search(this.value)
							.draw();
					}
				});
			});

		}
	});


	$('#fcpname').on('change', function () {
		var l = $('#fcpname').val();
		if (l == null)
			l = 'Select Product';
		$('.pkey').text(l);
	});

	$('#fccname').on('change', function () {
		var l = $('#fccname').val();
		$('.pkey').text('Select Product');
		$('ckey').text(l);
		getproducts(l);

	});

	$('#distribute').on('change', function () {
		var v = $('#distribute').val();

		if(v != 0){
			$('#user2').prop('checked','checked');
			$('#user1').prop('checked','checked');
		}

		$('#user1authproducts option').remove();
		$('#user1authproducts').append(newOption).trigger('change');
		$('#user2authproducts option').remove();
		$('#user2authproducts').append(newOption).trigger('change');
		if (v == 'source') {
			var newOption = new Option('Website', 'website', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('Landing page', 'Landingpage', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('Call', 'Call', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('Visit', 'Visit', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('Website', 'website', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
			var newOption = new Option('Landing page', 'Landingpage', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
			var newOption = new Option('Call', 'Call', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
			var newOption = new Option('Visit', 'Visit', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
		}
		if (v == 'product') {
			$('.mt-repeater-item').each(function () {
				optname = $(this).find('.textin').val();
				var pid = null;
				if ($(this).find('.textin').siblings('.pid').length) {
					pid = $(this).find('.textin').siblings('.pid').val();
				} else {
					pid = optname;
				}
				console.log(pid);
				var newOption = new Option(optname, pid, false, false);
				$('#user1authproducts').append(newOption).trigger('change');
				var newOption = new Option(optname, pid, false, false);
				$('#user2authproducts').append(newOption).trigger('change');
			})
		}
		if (v == 'date') {
			var newOption = new Option('odd', 'odd', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('even', 'even', false, false);
			$('#user1authproducts').append(newOption).trigger('change');
			var newOption = new Option('odd', 'odd', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
			var newOption = new Option('even', 'even', false, false);
			$('#user2authproducts').append(newOption).trigger('change');
		}
	});

	$('body').on('change', 'input.textin', function () {
		// $(this).attr('readonly', 'readonly');
		nullmanageleads();

	})

	function nullmanageleads() {
		if ($('#distribute').val() == 'product') {
			$('#distribute').val('0');
			$('#distribute').trigger('change');
			$('#user1authproducts option').remove();
			$('#user2authproducts option').remove();
			$('#user2authproducts').trigger('change');
			$('#user1authproducts').trigger('change');
		}
	}

	function getproducts(l) {
		$.ajax({
			url: 'http://localhost/landingapp/code/clientproducts/' + l,
			dataType: 'json'
		}).done(function (data) {
			console.log(data);
			$('#fcpname option').remove();
			$('#fcpname').append(newOption).trigger('change');
			var newOption = new Option('', '', false, false);
			$('#fcpname').append(newOption).trigger('change');
			for (i = 0; i < data.length; i++) {
				var newOption = new Option(data[i].product_name, data[i].productkey, false, false);
				$('#fcpname').append(newOption).trigger('change');
			}
			$('.ckey').text(l);

		});
	}



	$('.mt-repeater').each(function () {
		$(this).repeater({
			initEmpty: true,
			show: function () {
				$(this).slideDown();
				nullmanageleads();
			},

			hide: function (deleteElement) {
				if (confirm('Are you sure you want to Remove this Product?')) {
					$(this).slideUp(deleteElement);
				}
				nullmanageleads();
			},

			ready: function (setIndexes) {
				// $('.textin').attr('readonly', 'readonly');
				$('.mt-repeater-input.remove').remove();
			}

		});
	});


	$('#username').change(function () {
		var v = $(this).val();
		if ($('#clientrowid').length)
			var rowid = $('#clientrowid').val();
		else
			var rowid = 'add';

		$.ajax({
			url: 'http://localhost/landingapp/client/checkusername',
			dataType: 'text',
			method: 'POST',
			data: {
				'username': v,
				'rowid': rowid
			}
		}).done(function (data) {
			if (data == 'fail') {
				$('#username').val('');
				alert('username already exists, please change it');
			}

		});
	})

	$('#adminusername').change(function () {
		var v = $(this).val();

		$.ajax({
			url: 'http://localhost/landingapp/admin/checkusername',
			dataType: 'text',
			method: 'POST',
			data: {
				'username': v
			}
		}).done(function (data) {
			if (data == 'fail') {
				$('#adminusername').val('');
				alert('username already exists, please change it');
			}

		});
	})


	$('#adminemail').change(function () {
		var v = $(this).val();
		var id = 'add';
		if ($('#adminrowid').length == 1)
			id = $('#adminrowid').val();
		$.ajax({
			url: 'http://localhost/landingapp/admin/checkemail',
			dataType: 'text',
			method: 'POST',
			data: {
				'email': v,
				'userid': id
			}
		}).done(function (data) {
			if (data == 'fail') {
				$('#adminemail').val('');
				alert('Email already exists, please change it');
			}

		});
	})

	$('#clientemail').change(function () {
		var v = $(this).val();
		var id = 'add';
		if ($('#clientrowid').length == 1)
			id = $('#clientrowid').val();
			
		$.ajax({
			url: 'http://localhost/landingapp/client/checkemail',
			dataType: 'text',
			method: 'POST',
			data: {
				'email': v,
				'userid': id
			}
		}).done(function (data) {
			if (data == 'fail') {
				$('#clientemail').val('');
				alert('Email already exists, please change it');
			}

		});
	})

	$(".addlead").submit(function (e) {

		e.preventDefault();
		var $ = jQuery;

		var postData = $(this).serializeArray(),
			formURL = $(this).attr("action"),
			$cfResponse = $('#contactFormResponse'),
			$cfsubmit = $(".addleadsubmit"),
			cfsubmitText = $cfsubmit.text();

		$cfsubmit.text("Sending...");


		$.ajax({
			url: formURL,
			type: "POST",
			data: postData,
			success: function (data) {
				$cfResponse.html(data);
				$cfsubmit.text(cfsubmitText);
				$('input').val('');
				$('select').val('').trigger('change');
			},
			error: function (data) {
				$cfsubmit.text(cfsubmitText);
				alert("Error occurd! Please try again");
			}
		});

		return false;

	});

	$('#defaultrange').daterangepicker({
		opens: (App.isRTL() ? 'left' : 'right'),
		startDate: moment().subtract('days', 0),
		endDate: moment(),
		//minDate: '01/01/2012',
		//maxDate: '12/31/2014',
		dateLimit: {
			days: 60
		},
		showDropdowns: true,
		showWeekNumbers: true,
		timePicker: false,
		timePickerIncrement: 1,
		timePicker12Hour: true,
		ranges: {
			'Today': [moment(), moment()],
			'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
			'Last 7 Days': [moment().subtract('days', 6), moment()],
			'Last 30 Days': [moment().subtract('days', 29), moment()],
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
		},
		buttonClasses: ['btn'],
		applyClass: 'green',
		cancelClass: 'default',
		format: 'DD/MM/YYYY',
		separator: ' to ',
		locale: {
			applyLabel: 'Apply',
			fromLabel: 'From',
			toLabel: 'To',
			customRangeLabel: 'Custom Range',
			daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			firstDay: 1
		}
	},
		function (start, end) {
			$('#defaultrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
			$('#datestart').val(start.format('YYYY/MM/DD'));
			$('#datend').val(end.format('YYYY/MM/DD'));
		}
	);
	//Set the initial state of the picker label
	// $('#defaultrange span').html(moment().subtract('days', 1).format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));


	
	$('.facebookCont').click(function(){
		$('iframe').contents().find("head")
		.append($("<style type='text/css'>  ._2p3a{width:100%!important;}  </style>"));
	})



	/***** Bootstrap Dropdown and Datatable Solution *****/

	var dropdownMenu;

	// and when you show it, move it to the body                                
	$(window).on('show.bs.dropdown', function (e) {

		// grab the menu
		dropdownMenu = $(e.target).parent('td').find('.dropdown-menu');

		// detach it and append it to the body
		$('body').append(dropdownMenu.detach());

		// grab the new offset position
		var eOffset = $(e.target).offset();

		// make sure to place it where it would normally go (this could be improved)
		dropdownMenu.css({
			'display': 'block',
			'top': eOffset.top + $(e.target).outerHeight(),
			'right': 0
		});

	});

	// and when you hide it, reattach the drop down, and hide it normally                                                   
	$(window).on('hide.bs.dropdown', function (e) {
		$(e.target).append(dropdownMenu.detach());
		dropdownMenu.hide();
	});


	google.charts.load('current', {
		'packages': ['corechart']
	});

	/*     function drawChart(){
	    // PIE CHART
	        var data = google.visualization.arrayToDataTable([
	            ['Task', 'Days'],
	            ['New', 11],
	            ['Active', 2],
	            ['Lost', 2],
	            ['Win', 2],
	            ['Close', 7]
	        ]);
    
	    var options = {
	        title: 'Leads Data',
	        pieHole: 0.4
	    };
    
	    var chart = new google.visualization.PieChart(document.getElementById('gchart_pie_1'));
	    chart.draw(data, options);
	    var chart2 = new google.visualization.PieChart(document.getElementById('gchart_pie_2'));
	    chart2.draw(data, options);
    
	    } */

	google.charts.setOnLoadCallback(drawChart);
})
