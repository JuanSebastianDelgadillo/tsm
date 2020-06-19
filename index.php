<!DOCTYPE html>
<html>
	<head>
		<?php
		//NIVEL DEL MAR
		include 'inc/cabecera.php';
		?>

	</head>
	<body>
		<div class="row" style="background-color:'#f8f8f8'">
			<div id="map" style="width:100%;height:1000px"></div>

		</div>
		<div class="modal fade" id="modal_grafico" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<div class="modal-title" id="exampleModalLabel" style="width: 100%;">
							<h5>TSM de la estación <label id="ciudad"></label> <label id="fec_actual"></label></h5>
							<h7 class="text-secondary" id="georefer"></h7>
							<br>
							<div class="w-100 mt-2" style="display: flex;">
								<div class="col border rounded m-1">
									<p class="text-info">Tº actual: </p>
									<p class="text-center" id="tem_actual"></p>
									 <small id="small_tem_actual" style="font-size: 10px;" class="form-text text-muted">
									 	
									 </small>
								</div>
								<div class="col border rounded m-1">
									<p class="text-info">Prom. actual: 
									<p class="text-center" id="tem_promedio"></p>
									 <small id="small_tem_promedio" style="font-size: 10px;" class="form-text text-muted">
									 	
									</small>
								</div>
								<div class="col border rounded m-1">
									<p class="text-info">Tº de Ayer: 
									<p class="text-center" id="tem_ayer"></p>
									 <small id="small_tem_ayer" style="font-size: 10px;" class="form-text text-muted">
									 	
									</small>
								</div>
								<div class="col border rounded m-1">
									<p class="text-info">Tº año atrás: 
									<p class="text-center" id="tem_ano"></p>
									 <small id="small_tem_ano" style="font-size: 10px;" class="form-text text-muted">
									 	
									</small>
								</div>
							</div>
						</div>
						<button type="button" class="close close_modal" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<div id="contenido">
							<div class="form-check">
							  <input class="form-check-input btn_get_fecha" id="tsmActual" type="checkbox" checked value="">
							  <label class="form-check-label" for="tsmActual">
							    TSM Actual
							  </label>
							</div>
							<div class="form-check">
							  <input class="form-check-input btn_get_fecha" id="tsmWeek" type="checkbox" value="" >
							  <label class="form-check-label" for="tsmWeek">
							    TSM Semana atrás
							  </label>
							</div>
							<div class="form-check">
							  <input class="form-check-input btn_get_fecha" id="tsmMonth" type="checkbox" value="">
							  <label class="form-check-label" for="tsmMonth">
							    TSM Mes atrás
							  </label>
							</div>
							<div class="form-check">
							  <input class="form-check-input btn_get_fecha" id="tsmYear" type="checkbox" value="">
							  <label class="form-check-label" for="tsmYear">
							    TSM Año atrás
							  </label>
							</div>
						</div>
						<div class="col-md-12 mt-2">
							<div id="tsm_Actual"></div>
							<div id="tsm_Week"></div>
							<div id="tsm_Month"></div>
							<div id="tsm_Year"></div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary close_modal" data-dismiss="modal">Cerrar</button>
					</div>
				</div>
			</div>
		</div>
	</body>
</html>
