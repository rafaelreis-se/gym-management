/**
 * Example of professional NFS-e workflow
 * This shows how major companies handle NFS-e processing
 */

import { NfseWorkflowService } from '../services/nfse-workflow.service';
import { NfseNotificationService } from '../services/nfse-notification.service';

export class ProfessionalNfseExample {
  constructor(
    private readonly workflowService: NfseWorkflowService,
    private readonly notificationService: NfseNotificationService
  ) {}

  /**
   * Complete professional workflow example
   */
  async processNfseProfessional(data: any): Promise<void> {
    try {
      // Step 1: Create RPS (Draft)
      console.log('📝 Step 1: Creating RPS...');
      const createResult = await this.workflowService.createRps(data);
      if (!createResult.success) {
        throw new Error(createResult.message);
      }
      console.log('✅ RPS created:', createResult.data.id);

      // Step 2: Validate RPS
      console.log('🔍 Step 2: Validating RPS...');
      const validateResult = await this.workflowService.validateRps(
        createResult.data.id
      );
      if (!validateResult.success) {
        throw new Error(validateResult.message);
      }
      console.log('✅ RPS validated');

      // Step 3: Send to webservice
      console.log('📤 Step 3: Sending to webservice...');
      const sendResult = await this.workflowService.sendRpsToWebservice(
        createResult.data.id
      );
      if (!sendResult.success) {
        throw new Error(sendResult.message);
      }
      console.log('✅ RPS sent to webservice');

      // Step 4: Send notification to customer
      console.log('📧 Step 4: Sending notification to customer...');
      await this.notificationService.notifyStatusChange(
        createResult.data.id,
        sendResult.newStatus
      );
      console.log('✅ Notification sent');

      // Step 5: Check processing status (this would be done by a scheduled job)
      console.log('🔄 Step 5: Checking processing status...');
      setTimeout(async () => {
        const statusResult = await this.workflowService.checkProcessingStatus(
          createResult.data.id
        );
        if (statusResult.success && statusResult.newStatus === 'APPROVED') {
          // Send NFS-e to customer
          await this.notificationService.sendNfseToCustomer(
            createResult.data.id
          );
          console.log('🎉 NFS-e approved and sent to customer!');
        }
      }, 30000); // Check after 30 seconds (in real life, this would be a scheduled job)
    } catch (error) {
      console.error('❌ Error in professional workflow:', error.message);
      throw error;
    }
  }

  /**
   * Batch processing example (like major companies do)
   */
  async processBatchNfse(nfseDataArray: any[]): Promise<void> {
    console.log(`🚀 Processing ${nfseDataArray.length} NFS-e in batch...`);

    const results = await Promise.allSettled(
      nfseDataArray.map((data) => this.processNfseProfessional(data))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(
      `✅ Batch processing completed: ${successful} successful, ${failed} failed`
    );
  }

  /**
   * Scheduled status checking (this would run as a cron job)
   */
  async checkAllPendingNfseStatus(): Promise<void> {
    console.log('🔄 Checking all pending NFS-e status...');

    // In a real implementation, you would query the database for pending NFS-e
    // const pendingNfse = await this.nfseRepository.find({
    //   where: { status: In([NfseStatus.SENT, NfseStatus.PROCESSING]) }
    // });

    // for (const nfse of pendingNfse) {
    //   await this.workflowService.checkProcessingStatus(nfse.id);
    // }
  }
}

/**
 * How major companies handle NFS-e:
 *
 * 1. 🏢 **Nubank, Stone, PagSeguro**: They create RPS, send to webservice,
 *    and automatically send NFS-e to customers via email
 *
 * 2. 📧 **Email Flow**:
 *    - Company sends NFS-e to customer
 *    - Customer receives email with NFS-e attached
 *    - Customer can download PDF from email
 *
 * 3. 🔄 **Status Management**:
 *    - DRAFT → VALIDATED → SENT → PROCESSING → APPROVED
 *    - Each status change triggers appropriate notifications
 *
 * 4. 📊 **Monitoring**:
 *    - Scheduled jobs check status periodically
 *    - Error handling and retry mechanisms
 *    - Batch processing for efficiency
 *
 * 5. 🎯 **Customer Experience**:
 *    - Automatic email notifications
 *    - Clear status updates
 *    - Easy access to NFS-e documents
 */
