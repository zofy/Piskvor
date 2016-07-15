var index = {};

index.redirect = function(){
    $('#nick').on('keypress', function(event){
//        if(event.which === 13) window.location.href = '';
        if(event.which === 13) alert('yupiii!');
    });
}

index.redirect();