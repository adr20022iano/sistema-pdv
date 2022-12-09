<?php

namespace Source\Core;

use Exception;

class ImageBase64 {

    /**
     * ImageBase64 constructor.
     * @param string $uploadDir
     * @param array $data
     */
    public function __construct(
        private string $uploadDir,
        private array $data,
    ) {}

    /**
     * Faz o envio de imagem em Base64
     * @param string $base64
     * @param int|null $codImage
     * @throws Exception
     */
    public function upload(string $base64, ?int $codImage = null): void {

        // Dados da imagem
        $baseDir = "/var/www/html/public/storage/".$this->uploadDir."/";
        $name = !empty($codImage) ? md5($this->uploadDir.$codImage).'.webp' : '.webp';

        // Obtain the original content (usually binary data)
        $base64 = str_replace("data:image/webp;base64,", "", $base64);
        $base64 = str_replace("data:image/png;base64,", "", $base64);
        $base64 = str_replace("data:image/jpg;base64,", "", $base64);
        $base64 = str_replace("data:image/jpeg;base64,", "", $base64);
        $base64 = str_replace("data:image/gif;base64,", "", $base64);
        $bin = base64_decode($base64);

        // Load GD resource from binary data
        $img = @imageCreateFromString($bin);

        // Make sure that the GD library was able to load the image
        // This is important, because you should not miss corrupted or unsupported images
        if (!$img) {
            throw new Exception("O valor Base64 não é uma imagem válida.", 415);
        }

        // Verifica se existe a pasta storage da assinatura
        if (!file_exists($baseDir) || !is_dir($baseDir)) {
            mkdir($baseDir, 0755, true);
        }

        // Monta as imagens
        foreach ($this->data as $image) {

            // Save the GD resource as PNG in the best possible quality (no compression)
            // This will strip any metadata or invalid contents (including, the PHP backdoor)
            // To block any possible exploits, consider increasing the compression level

            // Calcula o tamanho da imagem
            $fileX = imagesx($img);
            $fileY = imagesy($img);

            if ($image['width']) {

                $imageW = ($image['width'] < $fileX ? $image['width'] : $fileX);
                $imageH = intval(($imageW * $fileY) / $fileX);

            } else {

                $imageW = $fileX;
                $imageH = $fileY;

            }

            // Cria a nova imagem
            $imageCreate = imagecreatetruecolor($imageW, $imageH);

            // Fundo transparente
            $transColour = imagecolorallocatealpha($imageCreate, 0, 0, 0, 127);
            imagefill($imageCreate, 0, 0, $transColour);

            imagecopyresampled($imageCreate, $img, 0, 0, 0, 0, $imageW, $imageH, $fileX, $fileY);
            imagewebp($imageCreate, $baseDir . $image['name'] . $name, 100);

            // Destrói imagens da memória
            imagedestroy($imageCreate);

        }

        // Destrói imagens da memória
        imagedestroy($img);

    }

    /**
     * Deleta uma imagem em Base64
     * @param int|null $codImage
     */
    public function delete(?int $codImage = null): void {

        // Dados da imagem
        $baseDir = "/var/www/html/public/storage/".$this->uploadDir."/";
        $name = !empty($codImage) ? md5($this->uploadDir.$codImage).'.webp' : '.webp';

        // Monta as imagens
        foreach ($this->data as $image) {

            if (file_exists($baseDir.$image['name'].$name)) {
                unlink($baseDir.$image['name'].$name);
            }

        }

    }

    /**
     * Verifica se existe a imagem
     * @param int|null $codImage
     * @param string|null $nameFilter
     * @param bool $b64
     * @return array|string|null
     */
    public function query(?int $codImage = null, ?string $nameFilter = null, bool $b64 = false): array|string|null {

        // Dados da imagem
        $baseDir = "/var/www/html/public/storage/".$this->uploadDir."/";
        $name = !empty($codImage) ? md5($this->uploadDir.$codImage).'.webp' : '.webp';

        if ($nameFilter) {

            if (file_exists($baseDir.$nameFilter.$name)) {

                if ($b64) {

                    $imagedata = file_get_contents($baseDir.$nameFilter.$name);
                    return 'data:image/webp;base64, '.base64_encode($imagedata);

                } else {

                    return BASE_URL."/storage/".$this->uploadDir."/".$nameFilter.$name;

                }

            } else {

                return null;

            }

        } else {

            $links = [];

            // Monta as imagens
            foreach ($this->data as $image) {

                if (file_exists($baseDir.$image['name'].$name)) {

                    $links[$image['name']] = BASE_URL."/storage/".$this->uploadDir."/".$image['name'].$name;

                }

            }

            // Verifica se achou imagem
            if (count($links) > 0) {

                return $links;

            } else {

                return null;

            }

        }

    }

}
