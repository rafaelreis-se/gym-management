# NFS-e Implementation Documentation

## Overview

This document describes the implementation of NFS-e (Electronic Service Invoice) functionality for the gym management system, specifically designed for Araxá - MG municipality.

## Architecture

The NFS-e module follows the established patterns in the system:

### Domain Layer (`libs/shared/domain`)

- **Entity**: `Nfse` - Main entity representing an electronic service invoice
- **Enums**: NFS-e status, RPS status, environment types, service types

### Types Layer (`libs/shared/types`)

- **Enums**: NFS-e related enumerations for status and service types

### API Layer (`apps/api/src/modules/nfse`)

- **Controller**: `NfseController` - REST endpoints for NFS-e operations
- **Service**: `NfseService` - Business logic for NFS-e management
- **DTOs**: Data Transfer Objects for API requests and responses
- **Infrastructure Services**:
  - `NfseWebService` - Integration with Araxá webservice
  - `XmlSigningService` - XML generation and digital signature

## Features Implemented

### 1. NFS-e Management

- Create, read, update, delete NFS-e records
- Validation of NFS-e data
- Status tracking (PENDING, SENT, PROCESSED, APPROVED, REJECTED, CANCELLED)

### 2. Webservice Integration

- XML generation following Araxá NFS-e format
- Digital signature using A1 certificates
- SOAP communication with municipal webservice
- Error handling and response parsing

### 3. Service Operations

- Send NFS-e to municipal webservice
- Cancel NFS-e
- Consult NFS-e status
- Batch operations for multiple NFS-e

### 4. Security

- JWT authentication required
- Role-based access control (ADMIN, INSTRUCTOR)
- Digital certificate integration
- Secure environment variable configuration

## API Endpoints

### NFS-e Management

- `POST /nfse` - Create new NFS-e
- `GET /nfse` - List all NFS-e
- `GET /nfse/:id` - Get NFS-e by ID
- `GET /nfse/number/:number/series/:series` - Get NFS-e by number and series
- `PATCH /nfse/:id` - Update NFS-e
- `DELETE /nfse/:id` - Delete NFS-e

### NFS-e Operations

- `POST /nfse/send` - Send NFS-e to webservice
- `POST /nfse/cancel` - Cancel NFS-e
- `GET /nfse/:id/status` - Consult NFS-e status

## Data Model

### NFS-e Entity

The `Nfse` entity includes:

- Basic information (number, series, type, emission date)
- Service provider information (CNPJ, municipal inscription)
- Service recipient information (CPF/CNPJ, address)
- Service details (code, description, values, taxes)
- NFS-e response information (protocol, number, link)
- Status tracking and timestamps

### Service Types

- **0107**: Jiu-jitsu classes
- **0108**: Sports training

## Configuration

### Environment Variables

Required environment variables for NFS-e functionality:

- `NFSE_WEBSERVICE_URL` - Araxá webservice URL
- `NFSE_CHAVE_ACESSO` - Access key from municipal portal
- `NFSE_CERTIFICATE_PATH` - Path to digital certificate
- `NFSE_CERTIFICATE_PASSWORD` - Certificate password
- Provider information (CNPJ, municipal inscription, business name)

### Municipal Portal Setup

1. Register at Araxá NFS-e portal
2. Request RPS authorization
3. Enable webservice communication
4. Generate access key
5. Obtain digital certificate A1

## Testing

### Unit Tests

- Service layer tests with mocked dependencies
- Validation tests for DTOs
- Error handling tests

### Integration Tests

- Webservice integration tests (with mock responses)
- XML generation and signing tests
- End-to-end workflow tests

## Dependencies

### Production Dependencies

- `xml-crypto` - XML digital signature
- `xmlbuilder2` - XML generation
- `fast-xml-parser` - XML parsing
- `@xmldom/xmldom` - DOM manipulation
- `xpath` - XML path queries

## Security Considerations

1. **Digital Certificates**: A1 certificates required for XML signing
2. **Access Keys**: Generated in municipal portal, stored securely
3. **Environment Variables**: All sensitive data in environment variables
4. **Authentication**: JWT-based authentication required
5. **Authorization**: Role-based access control

## Error Handling

The implementation includes comprehensive error handling:

- Validation errors for invalid data
- Webservice communication errors
- Certificate and signing errors
- Municipal portal response errors
- Network and timeout errors

## Future Enhancements

1. **NF-e Support**: Extension for product invoices
2. **Multiple Municipalities**: Support for other cities
3. **Batch Processing**: Improved batch operations
4. **Reporting**: NFS-e reporting and analytics
5. **Integration**: Integration with accounting systems

## Usage Examples

### Creating an NFS-e

```typescript
const createNfseDto: CreateNfseDto = {
  number: 1,
  series: 'A',
  type: 1,
  emissionDate: '2024-01-01',
  operationNature: 1,
  simpleNationalOptant: true,
  culturalIncentivizer: false,
  recipient: {
    name: 'John Doe',
    cpf: '12345678901',
    address: {
      street: 'Main St',
      number: '123',
      district: 'Downtown',
      cityCode: '1234567',
      state: 'MG',
      zipCode: '12345678',
    },
  },
  service: {
    serviceCode: ServiceType.JIU_JITSU_CLASS,
    description: 'Jiu-jitsu classes',
    taxRate: 5.0,
    serviceValue: 100.0,
    netValue: 95.0,
    issWithheld: false,
    serviceDiscrimination: 'Monthly jiu-jitsu classes',
    serviceCityCode: '1234567',
  },
};

const nfse = await nfseService.create(createNfseDto);
```

### Sending NFS-e

```typescript
const result = await nfseService.sendNfse(['nfse-id-1', 'nfse-id-2']);
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
```

## Troubleshooting

### Common Issues

1. **Certificate Errors**: Verify certificate path and password
2. **Access Key Errors**: Ensure key is correctly generated in portal
3. **XML Validation**: Check service codes and required fields
4. **Network Issues**: Verify webservice URL and firewall settings

### Debugging

- Enable detailed logging for XML generation and signing
- Check webservice responses for error details
- Validate certificate and access key configuration
- Test with homologation environment first

## Conclusion

The NFS-e implementation provides a complete solution for electronic service invoice management in Araxá - MG, following best practices for security, error handling, and maintainability. The modular architecture allows for easy extension and modification as requirements evolve.
