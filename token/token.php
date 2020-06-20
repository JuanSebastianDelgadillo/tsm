<?php
	date_default_timezone_set('UTC');
	$fechayhora = date('Y-m-d H:i');
	$hora = date('H:i');
	$horaActual = date('H:i',strtotime('-5 minute', strtotime( $hora)));
	$tsmActual = date('Y-m-d');
	$tsmWeek = date( 'Y-m-d', strtotime( '-1 weeks' ) );
	$tsmMonth = date( 'Y-m-d', strtotime( '-1 months' ) );
	$tsmYear = date( 'Y-m-d', strtotime( '-1 years' ) );
	$tsmAyer = date( 'Y-m-d', strtotime( '- 1 days' ) );
	$token = getTokenApp();

	function getTokenApp() {
	  $passphrase = 'kernighanandritchie' ;
	  $fechahora  = strftime('%Y%m%d',time());
	  return md5($passphrase.$fechahora);
	  // return 'b8c45d2b65493cd629fc0042f8fdb79c';
	}
	

?>