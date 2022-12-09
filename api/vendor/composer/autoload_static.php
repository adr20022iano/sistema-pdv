<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit8f1b12100c9404d7c48432728a1a412f
{
    public static $files = array (
        'c701c9f0a531ff2c2d48e4cf42d58201' => __DIR__ . '/../..' . '/source/Support/Helpers.php',
        'eb815be7608de86324b40d48103d8594' => __DIR__ . '/../..' . '/source/Support/Config.php',
    );

    public static $prefixLengthsPsr4 = array (
        'S' => 
        array (
            'Source\\' => 7,
        ),
        'C' => 
        array (
            'CoffeeCode\\Router\\' => 18,
        ),
        'A' => 
        array (
            'Ahc\\Jwt\\' => 8,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'Source\\' => 
        array (
            0 => __DIR__ . '/../..' . '/source',
        ),
        'CoffeeCode\\Router\\' => 
        array (
            0 => __DIR__ . '/..' . '/coffeecode/router/src',
        ),
        'Ahc\\Jwt\\' => 
        array (
            0 => __DIR__ . '/..' . '/adhocore/jwt/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit8f1b12100c9404d7c48432728a1a412f::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit8f1b12100c9404d7c48432728a1a412f::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit8f1b12100c9404d7c48432728a1a412f::$classMap;

        }, null, ClassLoader::class);
    }
}