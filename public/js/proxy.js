$(function () {
    var public_key = "-----BEGIN PUBLIC KEY-----\n" +
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC2s1jNEI45HuQGdIaNlrxi+GQp\n" +
        "rZrzVEtxWD1Nq3s4899qkJIiFQr+MYRwCfRWvYn/xLRt/i1UqbtUvjkYOkyqFHu1\n" +
        "svxZMAbGIUQqdFDkAIQcVYt5Ux2aUH/DJvBRsIF68TO7XTvImi6flJtle92rIsev\n" +
        "qH+4kv82Txfa68nWnQIDAQAB\n" +
        "-----END PUBLIC KEY-----";

    var crypt = new JSEncrypt();
    crypt.setPublicKey(public_key);

    var baseUrl = window.location.href;
    $("#url").focus(function () {
        $(this).keyup(function (event) {
            if (event.keyCode == 13) {
                var url = $("#url").val();
                if ('' === url || undefined === url) {
                    return;
                }
                if (!url.startsWith("http://") && !url.startsWith("https://")) {
                    url = "http://" + url;
                }
                var encryptUrl = crypt.encrypt(url);
                $("#content").attr("src", baseUrl + "/" + encodeURIComponent(encryptUrl));
            }
        });
    });
    $("#content").load(function() {
        changeFrameHeight();
    });

    function changeFrameHeight() {
        var iframe = document.getElementById("content");
        iframe.height = document.documentElement.clientHeight;

    }

    window.onresize = function () {
        changeFrameHeight();
    }
});
