$(function($) {
  $('#endDate').bootstrapMaterialDatePicker({
    weekStart: 0
  });
  $('#startDate').bootstrapMaterialDatePicker({
    weekStart: 0
  }).on('change', function(e, date) {
    $('#endDate').bootstrapMaterialDatePicker('setMinDate', date);
  });
});
