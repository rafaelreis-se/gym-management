/**
 * NFS-e status enumeration
 */
export enum NfseStatus {
  // RPS States (before sending to webservice)
  DRAFT = 'DRAFT', // RPS created but not validated
  VALIDATED = 'VALIDATED', // RPS validated and ready to send
  SENDING = 'SENDING', // Currently being sent to webservice
  PENDING = 'PENDING', // Legacy status for backward compatibility

  // Webservice Response States
  SENT = 'SENT', // Successfully sent to webservice
  PROCESSING = 'PROCESSING', // Being processed by municipality
  PROCESSED = 'PROCESSED', // Processed by municipality

  // Final States
  APPROVED = 'APPROVED', // NFS-e approved and generated
  REJECTED = 'REJECTED', // Rejected by municipality
  CANCELLED = 'CANCELLED', // Cancelled by user/system

  // Error States
  SEND_ERROR = 'SEND_ERROR', // Error sending to webservice
  PROCESSING_ERROR = 'PROCESSING_ERROR', // Error during processing
}

/**
 * RPS status enumeration
 */
export enum RpsStatus {
  NORMAL = 'NORMAL',
  CANCELED = 'CANCELED',
}

/**
 * NFS-e environment enumeration
 */
export enum NfseEnvironment {
  HOMOLOGATION = 'HOMOLOGATION',
  PRODUCTION = 'PRODUCTION',
}

/**
 * Service types enumeration
 */
export enum ServiceType {
  JIU_JITSU_CLASS = '0107', // Jiu-jitsu classes code
  SPORTS_TRAINING = '0108', // Sports training code
}

/**
 * ISS retention enumeration
 */
export enum IssRetention {
  YES = 'SIM',
  NO = 'NAO',
}
