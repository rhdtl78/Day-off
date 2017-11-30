$(function($) {
  $('#startDate').datepicker({
    language: 'en',
    pick12HourFormat: true,
    defalutDate: new Date()
  });
  $('#endDate').datepicker({
    language: 'ko',
    pickTime: true,
    defalutDate: new Date()
  });
});
