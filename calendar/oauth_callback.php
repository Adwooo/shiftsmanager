<?php
    require_once '../vendor/autoload.php';
    function buildService($credentials) {
        $apiClient = new Google_Client();
        $apiClient->setUseObjects(true);
        $apiClient->setAccessToken($credentials);
        return new Google_DriveService($apiClient);
    }

    $client = new Google_Client();
    $client->setApplicationName('My App');
    $client->setScopes(array('https://www.googleapis.com/auth/calendar'));
    $client->setClientId('FILL_IT');
    $client->setAuthConfigFile('FILL_IT');
    // $client->setClientSecret('mmAsfvLks2Ju5-_kxpyYuxUk');
    $client->setRedirectUri('http://localhost:80/shiftsmanager/calendar/oauth_callback.php');
    $client->setApprovalPrompt('force');
    $client->setAccessType('offline');
    $client->setDeveloperKey('FILL_IT');

    // if the access token have expired, then use the refresh token
    if ($client->isAccessTokenExpired()) {
        $client->refreshToken("FILL_IT");
        $accessToken = $client->getAccessToken();
        echo "<pre>";
        print_r($accessToken);
        echo "</pre>";
    }

    // if you need to take refresh token, do it like this...
    // if ($_GET['code']) {
    //     // Refresh the token if it's expired.
    //     $accessToken = $client->authenticate($_GET['code']);
    //     $client->setAccessToken($accessToken);
    //     $refreshtoken = $client->getRefreshToken();

    //     echo "<pre>";
    //     print_r($client->getRefreshToken());
    //     echo "</pre>";

    //     // 1/6QghpC9d-kWbSeYUhCWsmgPI2DVH5LhCR-iUhIQWIJ190RDknAdJa_sgfheVM0XT
    //     // refresh token: ya29.CjHZAqt3EvKyNUNTQ-sRLOaHbvnLEH9Rb2bcwW1VQuZj6Y1ugL4p7sbsfpaJ2v_8nnK9
        
        
    //     // $client->authenticate($_GET['code']);
    //     // $access_token = $client->getAccessToken();
    //     echo "<pre>";
    //     print_r(json_decode($accessToken,true)['access_token']);
    //     echo "</pre>";

    //     if (empty($accessToken)) {
    //         exit;
    //     }
    // }

    echo "<pre>";
    print_r($_GET);
    echo "</pre>";
?>

<html>
    <head>
        <script>
            var googleAccessToken = "<?php echo json_decode($accessToken,true)['access_token']; ?>";
            console.log(googleAccessToken);
            if (googleAccessToken) {
                window.localStorage.setItem("access_token", googleAccessToken);
                window.location.href = "http://localhost/shiftsmanager/#/";
            } else {
                alert("Problem authenticating");
            }
        </script>
    </head>
    <body>
    <p>Redirecting...</p>
    </body>
</html>
