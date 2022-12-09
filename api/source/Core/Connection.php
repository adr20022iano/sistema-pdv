<?php

namespace Source\Core;

use PDO;
use PDOException;

class Connection {

    private static PDO $instance;

    /**
     * Conexão com DB
     * @param string|null $dbName
     * @return PDO|bool
     */
    public static function getConn(string $dbName = null): PDO|bool {

        // Verifica se existe uma instância com o DB
        if (!isset(self::$instance)) {

            try {

                return self::$instance = ConnDb($dbName);

            } catch (PDOException) {
             
                return false;

            }
            
        } else {

            return self::$instance;
            
        }

    }

}
