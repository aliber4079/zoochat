<?php

// this is just for the easy bootstrapping of the demo
// adapted from http://stackoverflow.com/a/38926070
// DON'T USE IN PRODUCTION, please code your own router or use a framework!

//phpinfo();
//exit;
chdir(__DIR__);
$filePath = realpath('./src/'.ltrim($_SERVER['REQUEST_URI'], '/'));
if ($filePath && is_dir($filePath)){
    // attempt to find an index file
    foreach (['index.php', 'index.html'] as $indexFile) {
        if ($filePath = realpath($filePath . DIRECTORY_SEPARATOR . $indexFile)){
            break;
        }
    }
}

if ($filePath && is_file($filePath)) {
    // 1. check that file is not outside of this directory for security
    // 2. check for circular reference to router.php
    // 3. don't serve dot files
    if (strpos($filePath, __DIR__ . DIRECTORY_SEPARATOR) === 0 &&
        $filePath !== __DIR__ . DIRECTORY_SEPARATOR . 'router.php' &&
        substr(basename($filePath), 0, 1) !== '.'
    ) {
        if (strtolower(substr($filePath, -4)) === '.php') {
            include $filePath;
        } else {
            if (strtolower(substr($filePath, -3)) === '.js') {
                header('Content-Type: text/javascript');
            } elseif (strtolower(substr($filePath, -4)) === '.jpg') {
                header('Content-Type: image/jpeg');
	    }
            readfile ($filePath);
        }
    } else {
        // disallowed file
        header('HTTP/1.1 404 Not Found');
        echo '404 Not Found';
    }
} else {
    // 404?
    // rewrite to our index file
    header("Location: /");
    //include  'src' . DIRECTORY_SEPARATOR . 'index.html';
}
