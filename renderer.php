<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\apicontroller;

class indexcontroller extends Controller
{
    public function render($path)
    {
        // APIS CALL
        $testApi = apicontroller::testApi();

        $renderer_source = File::get(base_path('node_modules/vue-server-renderer/basic.js'));
        $app_source = File::get(public_path('js/entry-server.js'));

        $v8 = new \V8Js();
        ob_start();

        $v8->setModuleLoader(function ($location) {
            return file_get_contents($location);
        });

        $js =
        // EOT { } is for array with json_encode()
        <<<EOT
            var process = { env: { VUE_ENV: "server", NODE_ENV: "production" } }; 
            this.global = { process: process }; 
            var url = "$path";
            const testApi = {$testApi};
        EOT;

        $v8->executeString($js);
        $v8->executeString($renderer_source);
        $v8->executeString($app_source);

        return ob_get_clean();
    }
}