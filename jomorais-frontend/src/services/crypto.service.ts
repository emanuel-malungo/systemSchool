/**
 * Serviço de Criptografia para SAFT-AO
 * Implementa assinatura digital RSA conforme Decreto Executivo 74/19
 */

import CryptoJS from 'crypto-js';

export interface IKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface ISignatureResult {
  hash: string;
  signature: string;
  timestamp: string;
}

class CryptoService {
  private privateKey: string | null = null;
  private publicKey: string | null = null;

  /**
   * Gera par de chaves RSA 2048 bits
   */
  async generateKeyPair(): Promise<IKeyPair> {
    try {
      // Em produção, usar Web Crypto API ou biblioteca RSA adequada
      // Para demonstração, simulamos a geração
      const keyPair = await this.simulateRSAKeyGeneration();
      
      this.privateKey = keyPair.privateKey;
      this.publicKey = keyPair.publicKey;
      
      console.log('🔐 Par de chaves RSA gerado com sucesso');
      return keyPair;
    } catch (error) {
      console.error('❌ Erro ao gerar par de chaves:', error);
      throw new Error('Falha na geração de chaves RSA');
    }
  }

  /**
   * Carrega chaves existentes
   */
  loadKeys(privateKey: string, publicKey: string): void {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    console.log('🔑 Chaves carregadas com sucesso');
  }

  /**
   * Gera hash SHA-256 de uma string
   */
  generateSHA256Hash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex).toUpperCase();
  }

  /**
   * Gera hash de fatura conforme SAFT-AO
   * Fórmula: SHA256(InvoiceNo + InvoiceDate + TaxInclusiveAmount + HashAnterior)
   */
  generateInvoiceHash(
    invoiceNo: string,
    invoiceDate: string,
    totalAmount: number,
    previousHash: string = ''
  ): string {
    const dataToHash = `${invoiceNo}${invoiceDate}${totalAmount.toFixed(2)}${previousHash}`;
    return this.generateSHA256Hash(dataToHash);
  }

  /**
   * Assina hash com chave privada (simulação RSA)
   */
  signHash(hash: string): ISignatureResult {
    if (!this.privateKey) {
      throw new Error('Chave privada não carregada');
    }

    try {
      // Em produção, usar RSA real
      const signature = this.simulateRSASignature(hash, this.privateKey);
      
      return {
        hash,
        signature,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erro ao assinar hash:', error);
      throw new Error('Falha na assinatura digital');
    }
  }

  /**
   * Verifica assinatura com chave pública
   */
  verifySignature(hash: string, signature: string, publicKey?: string): boolean {
    try {
      const keyToUse = publicKey || this.publicKey;
      if (!keyToUse) {
        throw new Error('Chave pública não disponível');
      }

      // Em produção, usar verificação RSA real
      return this.simulateRSAVerification(hash, signature, keyToUse);
    } catch (error) {
      console.error('❌ Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Gera hash de encadeamento para sequência de faturas
   */
  generateChainHash(invoices: Array<{
    invoiceNo: string;
    invoiceDate: string;
    totalAmount: number;
  }>): Array<{ invoiceNo: string; hash: string; signature: string }> {
    const results = [];
    let previousHash = '';

    for (const invoice of invoices) {
      const hash = this.generateInvoiceHash(
        invoice.invoiceNo,
        invoice.invoiceDate,
        invoice.totalAmount,
        previousHash
      );

      const signatureResult = this.signHash(hash);
      
      results.push({
        invoiceNo: invoice.invoiceNo,
        hash: hash,
        signature: signatureResult.signature
      });

      previousHash = hash;
    }

    return results;
  }

  /**
   * Valida cadeia de hashes
   */
  validateHashChain(invoices: Array<{
    invoiceNo: string;
    invoiceDate: string;
    totalAmount: number;
    hash: string;
    signature: string;
  }>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    let previousHash = '';

    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      
      // Recalcular hash esperado
      const expectedHash = this.generateInvoiceHash(
        invoice.invoiceNo,
        invoice.invoiceDate,
        invoice.totalAmount,
        previousHash
      );

      // Verificar se hash está correto
      if (invoice.hash !== expectedHash) {
        errors.push(`Fatura ${invoice.invoiceNo}: Hash inválido`);
      }

      // Verificar assinatura
      if (!this.verifySignature(invoice.hash, invoice.signature)) {
        errors.push(`Fatura ${invoice.invoiceNo}: Assinatura inválida`);
      }

      previousHash = invoice.hash;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Exporta chave pública em formato PEM
   */
  exportPublicKeyPEM(): string {
    // Tentar carregar chave do localStorage se não estiver em memória
    if (!this.publicKey) {
      const storedPublicKey = localStorage.getItem('saft_public_key');
      if (storedPublicKey) {
        this.publicKey = storedPublicKey;
      } else {
        throw new Error('Chave pública não disponível. Gere as chaves primeiro.');
      }
    }

    // Simular uma chave pública RSA válida em formato PEM
    // Em produção, usar a chave real gerada
    const publicKeyBase64 = this.formatBase64ForPEM(this.publicKey);
    
    return `-----BEGIN PUBLIC KEY-----
${publicKeyBase64}
-----END PUBLIC KEY-----`;
  }

  /**
   * Formata string para base64 válido em PEM (64 caracteres por linha)
   */
  private formatBase64ForPEM(data: string): string {
    // Converter para base64 se necessário
    let base64Data = data;
    
    // Se não for base64, converter
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data)) {
      base64Data = btoa(data);
    }
    
    // Quebrar em linhas de 64 caracteres
    const lines = [];
    for (let i = 0; i < base64Data.length; i += 64) {
      lines.push(base64Data.substring(i, i + 64));
    }
    
    return lines.join('\n');
  }

  /**
   * Gera chave pública RSA simulada mais realista
   */
  private generateRealisticPublicKey(): string {
    // Simular uma chave pública RSA 2048 bits em base64
    const keyComponents = [
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
      this.generateRandomBase64(200),
      'wIDAQAB'
    ].join('');
    
    return keyComponents;
  }

  /**
   * Gera string base64 aleatória
   */
  private generateRandomBase64(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Simulação de geração de chaves RSA
   * Em produção, usar Web Crypto API ou biblioteca adequada
   */
  private async simulateRSAKeyGeneration(): Promise<IKeyPair> {
    // Simular delay de geração
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timestamp = Date.now().toString();
    const privateKey = CryptoJS.SHA256(`private_${timestamp}`).toString();
    const publicKey = this.generateRealisticPublicKey();

    return { privateKey, publicKey };
  }

  /**
   * Simulação de assinatura RSA
   */
  private simulateRSASignature(hash: string, privateKey: string): string {
    const combined = `${hash}_${privateKey}`;
    return CryptoJS.SHA256(combined).toString(CryptoJS.enc.Hex).toUpperCase();
  }

  /**
   * Simulação de verificação RSA
   */
  private simulateRSAVerification(hash: string, signature: string, publicKey: string): boolean {
    // Simular verificação baseada na chave pública
    const privateKeySimulated = CryptoJS.SHA256(`private_${publicKey.slice(-10)}`).toString();
    const expectedSignature = this.simulateRSASignature(hash, privateKeySimulated);
    return signature === expectedSignature;
  }

  /**
   * Gera número de controle para AGT
   */
  generateControlNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `${timestamp}${random}`.slice(-9); // 9 dígitos
  }

  /**
   * Valida NIF angolano
   */
  validateNIF(nif: string): boolean {
    // Remover espaços e caracteres especiais
    const cleanNIF = nif.replace(/\D/g, '');
    
    // Deve ter exatamente 9 dígitos
    if (cleanNIF.length !== 9) {
      return false;
    }

    // Validação básica de NIF angolano
    // Em produção, implementar algoritmo oficial
    return /^\d{9}$/.test(cleanNIF);
  }

  /**
   * Formata NIF para exibição
   */
  formatNIF(nif: string): string {
    const cleanNIF = nif.replace(/\D/g, '');
    if (cleanNIF.length === 9) {
      return `${cleanNIF.slice(0, 3)} ${cleanNIF.slice(3, 6)} ${cleanNIF.slice(6)}`;
    }
    return nif;
  }
}

export default new CryptoService();
