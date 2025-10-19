# NFS-e Environment Variables

This document describes the environment variables required for NFS-e (Electronic Service Invoice) functionality in Araxá - MG.

## Required Environment Variables

### NFS-e Webservice Configuration

```bash
# NFS-e webservice URL for Araxá - MG
NFSE_WEBSERVICE_URL=https://webservice.araxa.mg.gov.br

# Access key generated in the municipal portal
NFSE_CHAVE_ACESSO=your-access-key-from-municipal-portal

# Path to your digital certificate (A1 format - .pfx file)
NFSE_CERTIFICATE_PATH=/path/to/your/certificate.pfx

# Password for the digital certificate
NFSE_CERTIFICATE_PASSWORD=your-certificate-password
```

### NFS-e Provider Information

```bash
# Your gym's CNPJ (14 digits)
NFSE_PROVIDER_CNPJ=12345678000195

# Municipal inscription number
NFSE_PROVIDER_INSCRICAO_MUNICIPAL=123456

# Business name (legal name)
NFSE_PROVIDER_RAZAO_SOCIAL=Your Gym Name

# Trade name (fantasy name) - optional
NFSE_PROVIDER_NOME_FANTASIA=Your Gym Fantasy Name
```

## Setup Instructions

### 1. Municipal Portal Registration

1. Access the NFS-e portal of Araxá: https://nfe.araxa.mg.gov.br/
2. Request authorization for RPS (Recibos Provisórios de Serviços) printing
3. Download the range with verification codes
4. Enable "Web Service" communication in the portal
5. Generate and save the "Access Key" (Chave de Acesso)

### 2. Digital Certificate

1. Obtain a digital certificate A1 (.pfx format) from a certified authority
2. Install the certificate on your server
3. Set the correct path and password in environment variables

### 3. Environment Configuration

1. Copy the example variables above to your `.env` file
2. Replace the placeholder values with your actual data
3. Ensure the certificate file is accessible at the specified path

## Service Codes for Jiu-Jitsu Gym

### Main Services

- **0107**: Jiu-jitsu classes
- **0108**: Sports training

### Additional Services (for future use)

- **0109**: Personal training
- **0110**: Sports equipment rental

## Testing

### Homologation Environment

For testing, use the homologation environment:

- URL: `https://homolog.webservice.araxa.mg.gov.br`
- Use test certificates and access keys

### Production Environment

For production:

- URL: `https://webservice.araxa.mg.gov.br`
- Use production certificates and access keys

## Security Notes

- Keep your digital certificate secure and backed up
- Never commit certificate files to version control
- Use environment variables for all sensitive data
- Regularly rotate access keys and certificates

## Troubleshooting

### Common Issues

1. **Certificate errors**: Verify certificate path and password
2. **Access key errors**: Ensure key is correctly generated in portal
3. **XML validation errors**: Check service codes and required fields
4. **Network errors**: Verify webservice URL and firewall settings

### Support

- Municipal NFS-e support: Contact Araxá municipal IT department
- Technical issues: Check logs and webservice response messages
