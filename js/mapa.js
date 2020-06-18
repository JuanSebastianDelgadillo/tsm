var datosprs = [];
var checkes = ['tsmActual', 'tsmWeek', 'tsmMonth', 'tsmYear'];

$(document).ready(function(){
	var cod;
	var mintw;
	var maxtw;
	var mymap = L.map('map').setView([-33.4372,  -70.6506], 5);

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(mymap);

	$.getJSON( "json/estaciones.json", function( data ) {
		for (var i in data) {
			var lat = data[i].lat;
			var long = data[i].long;
			var estacion = data[i].estacion;
			var codigo = data[i].cod;

			var marcador = L.marker([lat, long],{
				title: estacion,
				alt: codigo,
				lat: lat,
				long: long
			}).addTo(mymap);

			marcador.on('click', function(e){
				limpiar_checkes();
				$('#tsm_Actual').empty();
				$('#tsm_Actual').removeAttr('style');
				$('#tsm_Week').empty();
				$('#tsm_Week').removeAttr('style');
				$('#tsm_Month').empty();
				$('#tsm_Month').removeAttr('style');
				$('#tsm_Year').empty();
				$('#tsm_Year').removeAttr('style');
							
				$('#tsmActual').prop('checked', true);

				$('#modal_grafico').modal({backdrop: 'static', keyboard: false});
				cod = this.options.alt;
				titulo = this.options.title;

				$('#ciudad').html(this.options.title);
				var grados = cargar_gradoMinSeg(this.options.lat, this.options.long)
				$('#georefer').html("Latitud : "+grados.lat+" Longitud : "+grados.long);

				// CARGO GRAFICO INICIAL (ACTUAL)
				var tip = verifica_tipo(cod);


				const start_inicial = async function(){
					try {

					const result = await busca_datos_iniciales(fechayhora, tip, cod, 'TSM Actual', tsmActual);
					if (result == 'OK') {
						const sum = await cargarGrafico(tip, cod, 'TSM Actual', tsmActual, 'tsm_Actual', '#00FFFF');;

					}
					}catch(err) {

					 	 errer(lugar);
					}
				}

				start_inicial();
	
			});
		}
	});

	// START ESCUCHA CHECKED

	$('#tsmActual').change(function() {
		var lug = 'tsm_Actual';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico(tip, cod, 'TSM Actual', tsmActual, lug, '#00FFFF');
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

    $('#tsmWeek').change(function() {
		var lug = 'tsm_Week';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico(tip, cod, 'TSM Semana atrás', tsmWeek, lug, '#00FFFF');
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

     $('#tsmMonth').change(function() {
		var lug = 'tsm_Month';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico(tip, cod, 'TSM Mes atrás', tsmMonth, lug, '#00FFFF');
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

    $('#tsmYear').change(function() {
		var lug = 'tsm_Year';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico(tip, cod, 'TSM Año atrás', tsmYear, lug, '#00FFFF');
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

    // FIN ESCUCHA CHECKED

    function limpiar_checkes()
    {
    	for (var i = 0; i < checkes.length; i++) {
    		$('#'+checkes[i]).prop('checked', false);
    	}
    }

    function inabilitar_checkes()
    {
    	for (var i = 0; i < checkes.length; i++) {
    		$('#'+checkes[i]).attr("disabled", true);
    	}
    }

    function habilitar_checkes()
    {
    	for (var i = 0; i < checkes.length; i++) {
    		$('#'+checkes[i]).attr("disabled", false);
    	}
    }
   
   
    function verifica_tipo(codigo)
    {
    	var tip = 'gprs';
    	if (codigo == 'SANF' || codigo == 'CMET' || codigo == 'OHIG') {
    		tip = 'goes';
    	}

    	return tip;

    }

    async function busca_datos_iniciales(fechayhora, tipo, codigo, titulo, fecha)
    {
    	console.log('Buscando datos iniciales....');
    	$('#fec_actual').html(fechayhora);
    	var ultimo_dato;
		var fecha_ultimo_dato;

    	var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+horaActual+':00&period=24&fmt=json&tipo=shoa&orden=DESC&token='+token;
    	$.ajax({
		 url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){
				
					$('#tem_actual').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
					$('#tem_promedio').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
					$('#tem_ayer').html('<img  width="40"class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
					$('#tem_ano').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
			},
			success: function(datos){

					var datosurl = [];
					var contad = 0;
					var sum = 0.0;
					var promed;
					var ultimo_dato;
					var ultimo_fecha;
					var datw;
					var fecha_ayer;
					var fecha_int_ayer;

					var fecha_ayer = new Date(tsmAyer);
					console.log(fecha_ayer);

					try {

						$.each(datos, function(index, elem){	
							if ($.isNumeric(elem.valor)){
								datosurl.push(elem);
							}
						});

					$.each(datos, function(ind, ele){

						if ($.isNumeric(ele.valor))
						{
							datw = ele.valor;
							sum = parseFloat(sum)+ parseFloat(datw);
							contad++;
						}

					});

					if ($.isNumeric(datw)) {
						$('#tem_actual').html('<h3>'+datw+' ºC</h3>');
					}else{
						$('#tem_actual').html('<h5 class="bg-info text-white">No hay info</h5>');
					}

					promed = sum / contad;
					promed = parseInt(promed * 10, 10) / 10;

					if ($.isNumeric(promed)) {
						$('#tem_promedio').html('<h3>'+promed+' ºC</h3>');
					}else{
						$('#tem_promedio').html('<h5 class="bg-info text-white">No hay info</h5>');
					}

					
					}catch(err) {
						
						$('#tem_actual').html('<div class="alert alert-warning" role="alert"><h7>No hay datos !</h7></div>');
					 	$('#tem_promedio').html('<div class="alert alert-warning" role="alert"><h7>No hay datos !</h7></div>');
					}

					$('#small_tem_actual').html(fechayhora+' UTC');
					$('#small_tem_promedio').html(fechayhora+' UTC');

						
					// console.log('promedio : '+promed);
					
					// $('#tem_actual').html(ultimo_dato);
					// $('#small_tem_actual').html(fecha_ultimo_dato);
					// $('#tem_ayer').html('<h3>16.3 ºC</h3>');
					// $('#tem_ano').html('<h3>16.3 ºC</h3>');



			}
		});
		console.log('inicial okey....');

		return 'OK';
    }    

	function cargarGrafico(tipo, codigo, titulo, fecha, lugar, color)
	{
		console.log('cargando grafico .....');
		var datosIniciales = 0;
		console.log(tipo);
		inabilitar_checkes();
		datosprs = [];
		mintw = 0.0;
		maxtw = 0.0;
		var contador = 0;
		var promedio = 0.0;
		var suma = 0.0;

		// console.log(horaActual);

		// console.log(token);
		// console.log(codigo);
		// console.log(fecha);

		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+horaActual+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;

		$.ajax({
			// url: 'http://provimar.mitelemetria.cl/apps/src/ws/wsgw.php?wsname=getData&idsensor=prs;rad&idestacion='+codigo+'&period=48&fmt=json&tipo=tecmar&orden=ASC&callback=?',
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){
				$("#"+lugar).removeAttr('style');
				$('#'+lugar).html('<div class="text-center m-3" id="loading"><img class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/></div>');
			},
			success: function(data){
				// INICIO DEL success

				// console.log(data);
				const start = async function(){
					try {

					// const result = await recuperar_promedios();
					// if (result == 'OK') {
						const sum = await ordena_datos();

						if (sum == 'OK') {
							const grap = await mostrar_grafico();

							if (grap == 'OK') {
			
								habilitar_checkes();
							}
						}
					// }
					}catch(err) {
					 	habilitar_checkes();
					 	 errer(lugar);
					}
				}	 

				// function recuperar_promedios()
				// {
					
					// for (var e in data){
					// 	var datotw;
					// 	if ($.isNumeric(data[e].valor)){
					// 		datotw = data[e].valor;
					// 	}else{
					// 		datotw = null;
					// 	}		
							
					// 	if (data[e].idcanal.localeCompare(tipo) == 0) 
					// 	{

					// 		if ($.isNumeric(datotw)) 
					// 		{
														
					// 			if (contador == 0 ) { mintw = datotw; maxtw = datotw; }
					// 			if (datotw < mintw) { mintw = datotw; }
					// 			if (datotw > maxtw) { maxtw = datotw; }
					// 			// contador = contador+1;
					// 			// suma = parseFloat(suma) + parseFloat(datotw);
					// 		}
					// 	}
								
					// }

					// promedio = suma / contador;
					// console.log('promedio : '+promedio);
					// console.log(mintw);
					// console.log(maxtw);
					// console.log(promedio);
				// 	return 'OK'
				// }
			
			
				// async function ordena_datos()
				// {
				// 	console.log('Ordenando datos....');
				// 	for (var i in data){
				// 		if (data[i].valor == 0 || data[i].valor == null ){
				// 			var dato = null;
				// 		}else{
				// 			var dato = data[i].valor;
				// 		}

				// 		if (i == 0 ) { mintw = dato; maxtw = dato; }
				// 		if (dato < mintw) { mintw = dato; }
				// 		if (dato > maxtw) { maxtw = dato; }

				// 		if (data[i].idcanal.localeCompare(tipo) == 0){
				// 			datosprs.push({
				// 				x: new Date(data[i].fechahora).getTime(),
				// 				y: dato
				// 			});
				// 		}

				// 		ordernarArreglo(datosprs);
				// 	}
				// 	return 'OK'
				// }

				async function ordena_datos()
				{
					var conta = 0;
					console.log('Ordenando datos....');
					for (var i in data){
						if ($.isNumeric(data[i].valor)){
							var dato = data[i].valor;
						}else{
							var dato = null;
						}

						if (conta == 0 ) { mintw = dato; maxtw = dato; }
						if (dato < mintw) { mintw = dato; }
						if (dato > maxtw) { maxtw = dato; }

						if (data[i].idcanal.localeCompare(tipo) == 0){
							datosprs.push({
								x: new Date(data[i].fechahora).getTime(),
								y: dato
							});
						}
						conta++;
						ordernarArreglo(datosprs);
					}
					return 'OK'
				}
		
		
				async function mostrar_grafico()
				{	
					console.log('Mostrando gráfico....');					
					$('#'+lugar+' #loading').remove();
					var options = opciones(mintw, maxtw, color);
					$("#"+lugar).empty();

				 	var chart = new ApexCharts($("#"+lugar)[0], options);

				 	chart.render();
				 	chart.updateOptions({
					  title: {
					  	text: titulo,
					  	style: {
					  		fontSize: '20px'
					  	}
					  }
					});

					console.log('Mostrando grafico');
					return 'OK'
				}

				start();

				//FIN SUCCESS
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });
	}

	function cargar_gradoMinSeg(lat, lng)
	{
		var latn = Math.abs(lat); /* Devuelve el valor absoluto de un número, sea positivo o negativo */
		var latgr = Math.floor(latn * 1); /* Redondea un número hacia abajo a su entero más cercano */
		var latmin = Math.floor((latn - latgr) * 60); /* Vamos restando el número entero para transformarlo en minutos */
		var latseg = ((((latn - latgr) * 60) - latmin) * 60); /* Restamos el entero  anterior ahora para segundos */
		var latc = (latgr + "º " + latmin + "\' " + latseg.toFixed(2) + '\"'); /* Prolongamos a centésimas de segundo */
		if (lat > 0) {
		  x = latc + ' N'; /* Si el número original era positivo, es Norte */
		} else {
		  x = latc + ' S'; /* Si el número original era negativo, es Sur */
		} /* Repetimos el proceso para la longitud (Este, -W-Oeste) */
		var lngn = Math.abs(lng);
		var lnggr = Math.floor(lngn * 1);
		var lngmin = Math.floor((lngn - lnggr) * 60);
		var lngseg = ((((lngn - lnggr) * 60) - lngmin) * 60);
		var lngc = (lnggr + "º " + lngmin + "\' " + lngseg.toFixed(2) + '\"');
		if (lng > 0) {
		  y = lngc + ' E';
		} else {
		  y = lngc + ' W';
		}

		return geos = {lat: x, long : y};
	}

	function errer(donde)
	{
		var err = '<div class="alert alert-warning text-center" role="alert">';
			err += 'No hay datos que mostrar !!';
			err += '</div>';
			$('#loading').remove();
			$("#"+donde).html(err);
	}

	function opciones(minTw, maxTw, color){

		minTw = (Math.round(minTw)-1);
		maxTw = (Math.round(maxTw)+1);

		console.log('datos mínimos :'+ minTw);
		console.log('datos Máximos :'+ maxTw);
		// console.log('datos  :'+ datosprs);

		var options = {
			chart: {
				height: "200px",
				defaultLocale: 'es',
				locales: [{
				    name: 'es',
				    options: {
						shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
						toolbar: {
							selection: 'Seleccionar',
							selectionZoom: 'Seleccionar zoom',
							zoomIn: 'Acercar',
							zoomOut: 'Alejar',
							pan: 'Desplazar',
							reset: 'Reestablecer Zoom',
						}
				    }
			  	}],
	    		type: 'line',
	    		stacked: false,
	    		toolbar: {
					show: true,
					tools: {
						download: false,
						selection: true,
						zoom: true,
						zoomin: true,
						zoomout: true,
						pan: true,
						reset: true
	  				},
	      		autoSelected: 'zoom'
	    		},
	    		zoom: {
					type: 'x',
					enabled: true
	       		},
	  		},
	  		colors: [color],
	  		stroke: {
		        width: [2,1],
		        curve: 'straight'
	      	},
			series: [
			{
				name: "TSM",
				data: datosprs
			}],
			xaxis: {
				type: "datetime",
				labels:{showDuplicates: true}
			},
			yaxis:{
				title:{
					text: "TSM (°C)"
				},
				min: minTw,
				max: maxTw
				// min: 10,
				// max: 20
			},
			tooltip: {
				enabled: true,
				x: {
					format: "dd MMM yyyy HH:mm"
				}
			},
			legend: {
				position: 'bottom',
				horizontalAlign: 'center'
			},
			markers: {
			    size: 0,
			    colors: "#990033",
			    strokeColor: '#fff',
			    strokeWidth: 2,
			    strokeOpacity: 0.9,
			    fillOpacity: 1,
			    discrete: [],
			    shape: "circle",
			    radius: 1,
			    offsetX: 1,
			    offsetY: 1,
			    hover: {
			      size: 6,
			      sizeOffset: 3
	    		},
			}
		};
		return options;
	}

	function ordernarArreglo (arreglo){
		arreglo.sort(function(a, b){
	    	return a.x - b.x;
		});

	}


});







