$(document).ready(function () {
    $(".generate").trigger("reset");
    if ($(".psrn").val() == "") {
        $(".faculty-result").text("Once a correct PSRN is entered , list of eligible patients will load here.");
    }
    $(".patient-type").change(function () {
        var selected = $(".patient-type :selected").val();
        if (selected !== 'Choose one') {
            if (selected == 'student') {
                $('.student').fadeIn();
                $('.faculty').css('display', 'none');
            } else {
                $('.faculty').fadeIn();
                $('.student').css('display', 'none');
            }
            // alert(selected)
        }
        else {
            $('.faculty').css('display', 'none');
            $('.student').css('display', 'none');

        }
    })
    $(".psrn").on("keyup change load", function () {
        var value = $(".psrn").val();
        if (value.length == 5) {
            $(".faculty-result").text("Loading ...");
            $.ajax({
                method: "POST",
                url: '/psrn',
                data: {
                    psrn: value
                },
                success: function (result) {
                    $('.faculty-result').html(result);
                },
                error: function (xhr) {
                    $('.faculty-result').html("<h2>Error</h2>" + xhr);
                }

            })
        } else {
            $(".faculty-result").text("Once a correct PSRN is entered , list of eligible patients will load here.");
        }
    })
})