let inputs = document.querySelectorAll('.input-type-file');
Array.prototype.forEach.call(inputs, function(input){
  let label	 = input.nextElementSibling,
    labelVal = label.innerHTML;
  input.addEventListener('change', function(e){
    let fileName = '';
    // if( this.files && this.files.length > 1 )
    //   fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
    // else
    //   fileName = e.target.value.split( '\\' ).pop();

    fileName = e.target.files[0].name;
    if( fileName )
      label.querySelector( 'span' ).innerHTML = fileName;
    else
      label.innerHTML = labelVal;
  });
  input.addEventListener('focus', function(){ input.classList.add( 'has-focus' ); });
  input.addEventListener('blur', function(){ input.classList.remove( 'has-focus' ); });

});

