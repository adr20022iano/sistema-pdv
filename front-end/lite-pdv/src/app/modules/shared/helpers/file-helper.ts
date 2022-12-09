export class FileHelper {

  /** Magic numbers dos tipos de arquivos permitidos - .jpeg | .png | .gif */
  readonly ALLOWED_MIME_TIPES: { format: string, magicNumber: string }[] = [
    {format: 'jpeg', magicNumber: 'FFD8FFE0'},
    {format: 'jpeg', magicNumber: 'FFD8FFE1'},
    {format: 'jpeg', magicNumber: 'FFD8FFEE'},
    {format: 'png', magicNumber: '89504E47'},
    {format: 'gif', magicNumber: '47494638'},
    {format: 'webp', magicNumber: '52494646'}
  ];

  /**
   * Recupera o arquivo que foi selecionado para upload pelo usuário e realiza as verificações
   * necessárias antes de realizar o envio.
   * @param event Evento `change` emitido pelo input do logo.
   */
  public validateSelectedFile(event): Promise<File> {

    const files = event.target.files as FileList;

    return new Promise((resolve, reject) => {

      if (files.length > 0) {

        // Recuperamos o primeiro arquivo selecionado, verificamos seu tamanho e então realizamos
        // a validação do seu MIME type antes de realizarmos o upload
        const selectedFile = files.item(0);
        const maxByteSize = 1024 * 5;
        if ((selectedFile.size / 1024) > maxByteSize) {
          reject('O tamanho do arquivo não deve superar 5MB.');
        }

        // Validação do tipo MIME do arquivo
        this.validateMime(selectedFile).then((valid) => {

          if (!valid) {
            reject('O arquivo deve ser do tipo jpeg, png, webp ou gif.');
          }

          // Já que o arquivo passou por todas as validações, o retornamos na promise
          resolve(selectedFile);

        }, () => {

          // Erro ao realizar validação MIME
          reject('Erro ao carregar o arquivo.');

        });

      }

    });

  }

  /**
   * Realiza a validação do MIME type do blob informado.
   * @param blob Blob que será validado.
   */
  private async validateMime(blob: Blob): Promise<boolean> {

    try {

      const contentBuffer = await this.readAsync(blob);
      return this.ALLOWED_MIME_TIPES.some(mimetype => contentBuffer === mimetype.magicNumber);

    } catch (err) {
      console.log(err);
    }

  }

  /**
   * Realiza a leitura do blob informado e recupera seus `magic numbers`
   * para realizar uma validação MIME.
   * @param blob Blob que será lido.
   */
  private readAsync(blob: Blob): Promise<string> {

    return new Promise((resolve, reject) => {

      // Inicializando o reader e definindo as funções quando o carregamento ocorrer com sucesso ou um erro ocorrer
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result.toString().split('').map(bit => bit.codePointAt(0).toString(16).toUpperCase()).join(''));
      };

      reader.onerror = () => {

        console.error('O FileReadr não conseguiu carregar o arquivo.');
        reject(new Error('Impossível ler o arquivo.'));

      };

      // Realizamos a leitura do arquivo como uma string binária
      reader.readAsBinaryString(blob.slice(0, 4));

    });

  }

}
