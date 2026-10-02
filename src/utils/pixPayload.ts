/**
 * Utility to generate official Brazilian Central Bank (BACEN) / EMV standard PIX BR Code payload.
 * Compliant with the "Manual do Pix" specifications.
 */

export interface PixPayloadOptions {
  pixKey: string;
  receiverName: string;
  city: string;
  amount?: string;
  description?: string;
  txId?: string;
}

/**
 * Strips accents, special diacritics, and limits string length for EMV compliance
 */
function sanitizeAscii(text: string, maxLength: number): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLength);
}

/**
 * Builds an EMV TLV (Type-Length-Value) field
 * ID (2 digits) + Length (2 digits) + Value
 */
function emvField(id: string, value: string): string {
  if (!value) return '';
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Computes the CRC-16/CCITT-FALSE checksum for the PIX payload
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates the complete standard PIX Copia e Cola / BR Code string
 */
export function generatePixPayload(options: PixPayloadOptions): string {
  const { pixKey, receiverName, city, amount, description, txId } = options;

  if (!pixKey || !pixKey.trim()) return '';

  const cleanKey = pixKey.trim();
  const cleanName = sanitizeAscii(receiverName, 25) || 'RECEBEDOR';
  const cleanCity = sanitizeAscii(city, 15) || 'CIDADE';
  const cleanTxId = txId ? sanitizeAscii(txId, 25) : '***';

  // ID 26: Merchant Account Information
  // 00: GUI (br.gov.bcb.pix)
  // 01: Pix key
  // 02: Optional message / infoAdicional
  let merchantAccount = emvField('00', 'br.gov.bcb.pix') + emvField('01', cleanKey);
  if (description && description.trim()) {
    const cleanDesc = sanitizeAscii(description, 25);
    if (cleanDesc) {
      merchantAccount += emvField('02', cleanDesc);
    }
  }

  // ID 54: Optional amount (formatted to 2 decimal places, e.g. "50.00")
  let amountField = '';
  if (amount && amount.trim()) {
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      amountField = emvField('54', parsed.toFixed(2));
    }
  }

  // ID 62: Additional Data Field Template (contains Reference Label / txId)
  const additionalData = emvField('62', emvField('05', cleanTxId));

  // Assemble main payload without CRC
  const payloadWithoutCRC =
    emvField('00', '01') + // Format indicator
    emvField('26', merchantAccount) + // Merchant Account Information
    emvField('52', '0000') + // Merchant Category Code
    emvField('53', '986') + // Currency code (BRL)
    amountField + // Optional Transaction Amount
    emvField('58', 'BR') + // Country Code
    emvField('59', cleanName) + // Merchant Name
    emvField('60', cleanCity) + // Merchant City
    additionalData + // Reference Label
    '6304'; // CRC16 Header

  const crc = calculateCRC16(payloadWithoutCRC);
  return `${payloadWithoutCRC}${crc}`;
}
