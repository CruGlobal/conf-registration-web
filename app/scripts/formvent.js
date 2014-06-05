// JavaScript Document

jQuery(function($) {

	$('#sortable').sortable( { handle: '.handle' } );
		
	$('#ajax-address').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/address.php'));
	});
	$('#ajax-checkbox').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/checkbox.php'));
	});
	$('#ajax-dropdown').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/dropdown.php'));
	});
	$('#ajax-email').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/email.php'));
	});
	$('#ajax-telephone').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/telephone.php'));
	});
	$('#ajax-gender').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/gender.php'));
	});
	$('#ajax-information').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/information.php'));
	});
	$('#ajax-multiple-choice').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/multiple-choice.php'));
	});
	$('#ajax-name').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/name.php'));
	});
	$('#ajax-number').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/number.php'));
	});
	$('#ajax-single-line-question').click( function() {
		$('#sortable').append($('<div class="formelement">').load('../includes/single-line-question.php'));
	});
	
	$(document).on('click', '.delete-btn', function(event) {
		$(event.target).closest('.formelement').remove();
	});
	$(document).on('click', '.copy-btn', function(event) {
		$(event.target).closest('.formelement').clone().appendTo( '#sortable' );;
	});
	$(document).on('click', '.editme', function(event) {
		$(event.target).closest('.formelement').toggleClass('edit');
	});
	$(document).on('change', '.field-label', function() {
		$(this).parent().parent().parent().parent().parent().children('div').children('div').children('.field-label').html($(this).val());
	});
	
	$(document).on('click', '.closed', function(event) {
		$(event.target).closest('.closed').parent().parent().next('.rowdetails').addClass('on');
		$(event.target).closest('i').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
		$(event.target).closest('.closed').addClass('expanded').removeClass('closed');
	});
	$(document).on('click', '.expanded', function(event) {
		$(event.target).closest('.expanded').parent().parent().next('.rowdetails').removeClass('on');
		$(event.target).closest('i').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
		$(event.target).closest('.expanded').addClass('closed').removeClass('expanded');
	});
	
	$(document).on('click', function(event) {
		if ($(event.target).hasClass('stayopen') || $(event.target).parent().hasClass('stayopen') || $(event.target).parent().parent().hasClass('stayopen') || $(event.target).parent().parent().parent().hasClass('stayopen') || $(event.target).parent().parent().parent().parent().hasClass('stayopen')) {
			$('.columns-btn').addClass('opened');
		} else {
			$('.columns-btn').removeClass('opened');
		}
	});
	$('.dropdown-toggle.opener').click( function() {
		if ($(this).parent().hasClass('opened')) {
			$('.columns-btn').removeClass('opened');
		} else {
			$('.columns-btn').addClass('opened');
		}
	});
	
	$('.tablecheck').prop('checked', true);
	$('.tablecheck').change( function() {
		column = $(this).attr('id');
		if (this.checked) {
			$('.'+ column).css('display', 'table-cell');
		} else {
			$('.'+ column).css('display', 'none');
		}
	});
	
});