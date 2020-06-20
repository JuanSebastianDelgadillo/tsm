var checkes = ['tsmActual', 'tsmWeek', 'tsmMonth', 'tsmYear'];
var validaPromedioAnno = 0;

$(document).ready(function(){
	var cod;
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

				$('#modal_grafico').modal({backdrop: 'static', keyboard: false});
				cod = this.options.alt;
				titulo = this.options.title;

				$('#ciudad').html(this.options.title);
				var grados = cargar_gradoMinSeg(this.options.lat, this.options.long)
				$('#georefer').html("Latitud : "+grados.lat+" Longitud : "+grados.long);

				// CARGO GRAFICO INICIAL (ACTUAL)
				var tipo = verifica_tipo(cod);

				$('#tem_actual').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
				$('#tem_promedio').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
				$('#tem_ayer').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');
				$('#tem_ano').html('<img width="40" class="text-center" src="http://www.shoa.cl/img/icons/loading_moneda_2.gif"/>');

				$('#small_tem_actual').html('');
				$('#small_tem_promedio').html('');
				$('#small_tem_ayer').html('');
				$('#small_tem_ano').html('');
				validaPromedioAnno = 0;

				cargar_datos_iniciales(tipo, cod);

			});
		}
	});


	function cargar_datos_iniciales(tipo, codigo)
	{

			const start = async function(){

					try {

						const sum = await datos_iniciales(tipo, codigo, tsmActual, horaActual);

					}catch(err) {
					 	console.log('error'+err);
						$('#tem_actual').html('<h4>No hay información</h4>');
						$('#tem_promedio').html('<h4>No hay información</h4>');
						$('#tem_ayer').html('<h4>No hay información</h4>');
					 	 
					}

					try {

						if (validaPromedioAnno == 0) {
							const grop = await cargarGraficoAnnoAtras(tipo, codigo, tsmYear, horaActual);
							validaPromedioAnno = 1;
						}

						
					}catch(err) {
						console.log('error'+err);
						$('#tem_ano').html('<h4>No hay información</h4>');
					 	
					}
						
						habilitar_checkes();

				}

				start();

	}





	// START ESCUCHA CHECKED

	$('#tsmActual').change(function() {
		var lug = 'tsm_Actual';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
           cargarGrafico_tsmActual(tip, cod, tsmActual, horaActual);
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

    $('#tsmWeek').change(function() {
		var lug = 'tsm_Week';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {

            cargarGrafico_tsmSemana(tip, cod, tsmWeek, horaActual);
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

     $('#tsmMonth').change(function() {
     	var lug = 'tsm_Month';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico_tsmMes(tip, cod, tsmMonth, horaActual);
        }else{
			$('#'+lug).empty();
			$("#"+lug).removeAttr('style');
        }    
    });

    $('#tsmYear').change(function() {
		var lug = 'tsm_Year';
		var tip = verifica_tipo(cod);
        
        if(this.checked) {
            cargarGrafico_tsmAno(tip, cod, tsmYear, horaActual);
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
    	console.log('Verificando tipo...');
    	var tip = 'gprs';
    	if (codigo == 'SANF' || codigo == 'CMET' || codigo == 'OHIG') {
    		tip = 'goes';
    	}

    	return tip;

    }

	async function datos_iniciales(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....');
		inabilitar_checkes();

		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;

		$.ajax({
			// url: 'http://provimar.mitelemetria.cl/apps/src/ws/wsgw.php?wsname=getData&idsensor=prs;rad&idestacion='+codigo+'&period=48&fmt=json&tipo=tecmar&orden=ASC&callback=?',
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var contador = 0;
				var suma = 0.0;
				var promedio = 0.0;
				var dato = 0.0;
				var valor_final = 0.0;
				var hora_final = null;
				var fecha_ahora = new Date(tsmAyer+" "+horaActual+":00").getTime();
				var elemdato = null;

				console.log('Inicando datos....datos inicales');

			try{
				$.each(data, function(index, elem){
					
					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != 'undefined' || elemdato != null || elemdato != 0 || $.isNumeric(elemdato)){
						dato = elemdato;

						var fecha_json = new Date(index).getTime();

						if (fecha_ahora == fecha_json) { 
							$('#tem_ayer').html('<h3>'+dato+' º C</h3>');
							$('#small_tem_ayer').html(elem.fechahora+ 'UTC');

						}

						valor_final = dato;
						hora_final = elem.fechahora;
						suma = suma + parseFloat(dato);
						contador++;

					}else{
						dato = null;
					}

				});

				if (valor_final != '') {
					$('#tem_actual').html('<h3>'+valor_final+' º C</h3>');
					$('#small_tem_actual').html(fechayhora+' UTC');
				}else{
					$('#tem_actual').html('Sin información');
					$('#small_tem_actual').html('');
				}

				// SACO PROMEDIO
				if ( suma != '') { promedio = suma/contador; }
					
				if (promedio != 0.0 && promedio != null) {

					$('#tem_promedio').html('<h3>'+promedio.toFixed(1)+' º C</h3>');
					$('#small_tem_promedio').html(hora_final+' UTC');
				}else{
					$('#tem_promedio').html('Sin información');
				}	
					
				console.log('Finalizando datos....datos inicales');
				return 'OK'
			}catch(err) {
				console.log('error'+err);
				$('#tem_actual').html('Sin información');
			 	$('#small_tem_actual').html('');
			 	$('#tem_promedio').html('Sin información');
			 	$('#small_tem_promedio').html('');
			}


				//FIN SUCCESS
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });
	}

	async function cargarGraficoAnnoAtras(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....ano atras');
		inabilitar_checkes();

		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;

		$.ajax({
			// url: 'http://provimar.mitelemetria.cl/apps/src/ws/wsgw.php?wsname=getData&idsensor=prs;rad&idestacion='+codigo+'&period=48&fmt=json&tipo=tecmar&orden=ASC&callback=?',
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var contador = 0;
				var suma = 0.0;
				var promedio = 0.0;
				var dato = 0.0;

				console.log('Inicando datos....datos año atras');
			try{
				$.each(data, function(index, elem){
					
					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != null || elemdato!= 0 || $.isNumeric(elemdato)){
						dato = elem.valor;
						suma = suma + parseFloat(dato);
						contador++;
					}else{
						dato = null;
					}

				});

				// SACO PROMEDIO
				if ( suma != '') { promedio = suma/contador; }
					
				if (promedio != 0.0 && promedio != null) {

					$('#tem_ano').html('<h3>'+promedio.toFixed(1)+' º C</h3>');
					$('#small_tem_ano').html(fecha+' '+hora+' UTC');
				}else{
					$('#tem_ano').html('Sin información');
					$('#small_tem_ano').html('');
				}	
			}catch(err) {
				console.log('error'+err);
				$('#tem_ano').html('Sin información');
			 	$('#small_tem_ano').html('');
			}
					
				console.log('Finalizando datos....datos años atras');
				return 'OK';

				//FIN SUCCESS
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });
	}


	// GRAFICO TSM_ACTUAL
	async function cargarGrafico_tsmActual(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....');
		inabilitar_checkes();
		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var dato = 0.0;
				var elemdato = null;
				var datosprsActual = [];
				var mintwActual = 0.0;
				var maxtwActual = 0.0;
				var contador = 0;



				console.log('Inicando datos....datos actual');

			try{

				$.each(data, function(index, elem){

					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != 'undefined' || elemdato != null || elemdato != 0 || $.isNumeric(elemdato)){
						contador++;

						if (mintwActual == 0.0) {
							mintwActual = elemdato;
						}

						if (maxtwActual == 0.0) {
							maxtwActual = elemdato;
						}

						if (elemdato < mintwActual) { mintwActual = elemdato; }
						if (elemdato > maxtwActual) { maxtwActual = elemdato; }


						datosprsActual.push({
							x: new Date(elem.fechahora).getTime(),
							y: elemdato
						});

					}else{
						dato = null;
					}

				});

				ordernarArreglo(datosprsActual);

				console.log('Mostrando gráfico.... actual');					
					$('tsm_Actual #loading').remove();
					var options = opcionesActual(mintwActual, maxtwActual, datosprsActual, '#00BFFF');
					$('#tsm_Actual').empty();

					// MOSTRANDO GRAFICO
				 	var chart = new ApexCharts($("#tsm_Actual")[0], options);

				 	chart.render();
				 	chart.updateOptions({
					  title: {
					  	text: 'TSM Actual',
					  	style: {
					  		fontSize: '20px'
					  	}
					  }
					});

				}catch(err) {
						console.log('error'+err);
						errer('tsm_Actual');
					 	
					}			
					
				console.log('Finalizando datos....datos inicales');
				return 'OK'

			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });

	    habilitar_checkes();
	}
	// GRAFICO TSM_ACTUAL


	// GRAFICO TSM_SEMANA
	async function cargarGrafico_tsmSemana(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....');
		inabilitar_checkes();
		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var dato = 0.0;
				var elemdato = null;
				var datosprsSemana = [];
				var mintwSemana = 0.0;
				var maxtwSemana = 0.0;
				var contador = 0;



				console.log('Inicando datos....datos semana');

			try{

				$.each(data, function(index, elem){

					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != 'undefined' || elemdato != null || elemdato != 0 || $.isNumeric(elemdato)){
						contador++;

						if (mintwSemana == 0.0) {
							mintwSemana = elemdato;
						}

						if (maxtwSemana == 0.0) {
							maxtwSemana = elemdato;
						}

						if (elemdato < mintwSemana) { mintwSemana = elemdato; }
						if (elemdato > maxtwSemana) { maxtwSemana = elemdato; }


						datosprsSemana.push({
							x: new Date(elem.fechahora).getTime(),
							y: elemdato
						});

					}else{
						dato = null;
					}

				});

				ordernarArreglo(datosprsSemana);

				console.log();

				console.log('Mostrando gráfico.... actual');					
					$('tsm_Week #loading').remove();
					var options = opcionesActual(mintwSemana, maxtwSemana, datosprsSemana, '#0080FF');
					$('#tsm_Week').empty();

					// MOSTRANDO GRAFICO
				 	var chart = new ApexCharts($("#tsm_Week")[0], options);

				 	chart.render();
				 	chart.updateOptions({
					  title: {
					  	text: 'TSM una semana atrás',
					  	style: {
					  		fontSize: '20px'
					  	}
					  }
					});
			}catch(err) {

				console.log('error'+err);
				errer('tsm_Week');
			 	
			}			
					
				console.log('Finalizando datos....datos inicales');
				return 'OK'

			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });

	    habilitar_checkes();
	}
	// GRAFICO TSM_SEMANA

	// GRAFICO TSM_MES
	async function cargarGrafico_tsmMes(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....');
		inabilitar_checkes();
		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var dato = 0.0;
				var elemdato = null;
				var datosprsMes = [];
				var mintwMes = 0.0;
				var maxtwMes = 0.0;
				var contador = 0;

			try{

				console.log('Inicando datos....datos actual');

				$.each(data, function(index, elem){

					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != 'undefined' || elemdato != null || elemdato != 0 || $.isNumeric(elemdato)){
						contador++;

						if (mintwMes == 0.0) {
							mintwMes = elemdato;
						}

						if (maxtwMes == 0.0) {
							maxtwMes = elemdato;
						}

						if (elemdato < mintwMes) { mintwMes = elemdato; }
						if (elemdato > maxtwMes) { maxtwMes = elemdato; }


						datosprsMes.push({
							x: new Date(elem.fechahora).getTime(),
							y: elemdato
						});

					}else{
						dato = null;
					}

				});

				ordernarArreglo(datosprsMes);

				console.log('Mostrando gráfico.... Mes');					
					$('tsm_Month #loading').remove();
					var options = opcionesActual(mintwMes, maxtwMes, datosprsMes, '#8000FF');
					$('#tsm_Month').empty();

					// MOSTRANDO GRAFICO
				 	var chart = new ApexCharts($("#tsm_Month")[0], options);

				 	chart.render();
				 	chart.updateOptions({
					  title: {
					  	text: 'TSM una mes atrás',
					  	style: {
					  		fontSize: '20px'
					  	}
					  }
					});
			}catch(err) {
				console.log('error'+err);
				errer('tsm_Month');
			 	
			}				
					
				console.log('Finalizando datos....datos inicales');
				return 'OK'

			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });

	    habilitar_checkes();
	}
	// GRAFICO TSM_MES

	// GRAFICO TSM_ANNO
	async function cargarGrafico_tsmAno(tipo, codigo, fecha, hora)
	{
		console.log('iniciando proceso .....');
		inabilitar_checkes();
		var url = 'http://wsprovimar.mitelemetria.cl/apps/src/ws/wsexterno.php?wsname=getData&idsensor=tw&idestacion='+codigo+'&date='+fecha+'T'+hora+':00&period=72&fmt=json&tipo=shoa&orden=DESC&token='+token;
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'jsonp',
			beforeSend: function(){

			},
			success: function(data){
				var dato = 0.0;
				var elemdato = null;
				var datosprsAnno = [];
				var mintwAnno = 0.0;
				var maxtwAnno = 0.0;
				var contador = 0;

			try{
				console.log('Inicando datos....datos anno');

				$.each(data, function(index, elem){

					if (elem.valor == 'undefined' || elem.valor == null) {
						
						elemdato = null;
					
					}else{
						elemdato = parseFloat(elem.valor);
					}

					if (elemdato != 'undefined' || elemdato != null || elemdato != 0 || $.isNumeric(elemdato)){
						contador++;

						if (mintwAnno == 0.0) {
							mintwAnno = elemdato;
						}

						if (maxtwAnno == 0.0) {
							maxtwAnno = elemdato;
						}

						if (elemdato < mintwAnno) { mintwAnno = elemdato; }
						if (elemdato > maxtwAnno) { maxtwAnno = elemdato; }


						datosprsAnno.push({
							x: new Date(elem.fechahora).getTime(),
							y: elemdato
						});

					}else{
						dato = null;
					}

				});

				ordernarArreglo(datosprsAnno);

				console.log('Mostrando gráfico.... anno');					
					$('tsm_Year #loading').remove();
					var options = opcionesActual(mintwAnno, maxtwAnno, datosprsAnno, '#BF00FF');
					$('#tsm_Year').empty();

					// MOSTRANDO GRAFICO
				 	var chart = new ApexCharts($("#tsm_Year")[0], options);

				 	chart.render();
				 	chart.updateOptions({
					  title: {
					  	text: 'TSM un año atrás',
					  	style: {
					  		fontSize: '20px'
					  	}
					  }
					});
			}catch(err) {
				console.log('error'+err);
				errer('tsm_Year');
			 	
			}				
					
				console.log('Finalizando datos....datos inicales');
				return 'OK'

			},
			error: function(XMLHttpRequest, textStatus, errorThrown){ 
	                    console.log("Status: " + textStatus); alert("Error: " + errorThrown); 
	        }
	    });

	    habilitar_checkes();
	}
	// GRAFICO TSM_ANNO


	function opcionesActual(minTw, maxTw, todosDatos, color){

		console.log('datos mínimos :'+ minTw);
		console.log('datos Máximos :'+ maxTw);

		minTw = ((Math.floor(minTw))-1);
		maxTw = ((Math.round(maxTw))+1);

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
				data: todosDatos
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


});







