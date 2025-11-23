import { Resend } from 'resend';

// Lazy initialization - only create Resend instance when needed
let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface TicketEmailData {
  ticketId: string;
  subject: string;
  description: string;
  category: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface TicketReplyEmailData {
  ticketId: string;
  subject: string;
  replyMessage: string;
  replyAuthor: string;
  userName: string;
  userEmail: string;
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  freeCredits: number;
}

export interface CreditsLowEmailData {
  userName: string;
  userEmail: string;
  creditsRemaining: number;
  totalUsed: number;
}

export interface CreditsDepletedEmailData {
  userName: string;
  userEmail: string;
  totalImagesProcessed: number;
}

export interface FirstUploadEmailData {
  userName: string;
  userEmail: string;
  creditsRemaining: number;
}

export interface PurchaseConfirmationEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  creditsAdded: number;
  amountPaid: number;
  currency: string;
  transactionId: string;
  nextBillingDate?: string;
}

/**
 * Send email notification when a new support ticket is created
 */
export async function sendTicketCreatedEmail(data: TicketEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift Support <support@pixelift.pl>',
      to: ['support@pixelift.pl'], // Admin email
      subject: `New Support Ticket: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Support Ticket Created</h2>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
            <p><strong>Created:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${data.description}</p>
          </div>

          <a href="https://pixelift.pl/admin/tickets"
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
            View in Admin Panel
          </a>
        </div>
      `,
    });

    console.log(`Ticket created email sent for ticket ${data.ticketId}`);
    return true;
  } catch (error) {
    console.error('Failed to send ticket created email:', error);
    return false;
  }
}

/**
 * Send email notification to user when admin replies to their ticket
 */
export async function sendTicketReplyEmail(data: TicketReplyEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift Support <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: `Re: ${data.subject} [Ticket #${data.ticketId}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Support Team Reply</h2>

          <p>Hi ${data.userName},</p>

          <p>Our support team has replied to your ticket:</p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>From:</strong> ${data.replyAuthor}</p>
          </div>

          <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
            <p style="white-space: pre-wrap; margin: 0;">${data.replyMessage}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated notification. To reply or view the full ticket history,
            please visit the admin panel or contact us at support@pixelift.pl
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

          <p style="color: #9ca3af; font-size: 12px;">
            Pixelift - AI Image Upscaling<br />
            <a href="https://pixelift.pl" style="color: #10b981;">pixelift.pl</a>
          </p>
        </div>
      `,
    });

    console.log(`Ticket reply email sent to ${data.userEmail} for ticket ${data.ticketId}`);
    return true;
  } catch (error) {
    console.error('Failed to send ticket reply email:', error);
    return false;
  }
}

/**
 * Send welcome email when user signs up
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: `Welcome to Pixelift - Your ${data.freeCredits} free credits are waiting! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">AI-Powered Image Upscaling</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome aboard, ${data.userName}! 👋</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              We're thrilled to have you join Pixelift. Your account is ready, and you have
              <strong style="color: #10b981;">${data.freeCredits} free credits</strong> to get started.
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">🚀 Quick Start Guide</h3>
              <ol style="color: #065f46; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Go to your <strong>Dashboard</strong></li>
                <li>Upload an image (PNG, JPG, or WEBP)</li>
                <li>Choose your settings (try "Quality Boost")</li>
                <li>Generate a <strong>FREE 200x200px preview</strong></li>
                <li>Download your upscaled image</li>
              </ol>
            </div>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #1e40af; margin: 0; font-size: 15px;">
                <strong>💡 Pro Tip:</strong> Use the FREE preview feature to test different settings
                before using your credits. Perfect for finding the best quality!
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pixelift.pl/dashboard"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Go to Dashboard →
              </a>
            </div>

            <h3 style="color: #1f2937; margin-top: 40px; font-size: 20px;">What you can do with Pixelift:</h3>
            <div style="margin: 20px 0;">
              <div style="margin-bottom: 15px;">
                <span style="color: #10b981; font-size: 20px;">✨</span>
                <strong style="color: #1f2937;"> Upscale images</strong> up to 8x resolution
              </div>
              <div style="margin-bottom: 15px;">
                <span style="color: #3b82f6; font-size: 20px;">🎨</span>
                <strong style="color: #1f2937;"> Enhance quality</strong> with AI-powered improvements
              </div>
              <div style="margin-bottom: 15px;">
                <span style="color: #8b5cf6; font-size: 20px;">📦</span>
                <strong style="color: #1f2937;"> Batch process</strong> up to 50 images at once
              </div>
              <div style="margin-bottom: 15px;">
                <span style="color: #f59e0b; font-size: 20px;">🔍</span>
                <strong style="color: #1f2937;"> Compare results</strong> with interactive before/after slider
              </div>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.6;">
              Need help getting started? Just reply to this email or visit our
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support page</a>.
              We're here to help!
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Upscaling</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">Website</a> •
              <a href="https://pixelift.pl/pricing" style="color: #10b981; text-decoration: none;">Pricing</a> •
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Welcome email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send notification when user's credits are running low
 */
export async function sendCreditsLowEmail(data: CreditsLowEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: `${data.userName}, you have ${data.creditsRemaining} credits left`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Credits Running Low</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Hi ${data.userName},
            </p>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Just a heads up - you have <strong style="color: #f59e0b;">${data.creditsRemaining} credits</strong>
              remaining in your Pixelift account.
            </p>

            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📊 Your Usage</h3>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Credits used this month:</strong> ${data.totalUsed}</p>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Images processed:</strong> ${data.totalUsed}</p>
              <p style="margin: 8px 0; color: #f59e0b;"><strong>Credits remaining:</strong> ${data.creditsRemaining}</p>
            </div>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Want to keep processing images? Check out our flexible plans:
            </p>

            <div style="margin: 25px 0;">
              <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #1e40af;">💎 Subscription Plans</strong>
                <p style="color: #1e40af; margin: 5px 0; font-size: 14px;">
                  From $0.05/credit • 100-1000 credits/month • Cancel anytime
                </p>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #065f46;">⚡ One-Time Purchase</strong>
                <p style="color: #065f46; margin: 5px 0; font-size: 14px;">
                  Buy 50-1000 credits • Credits never expire • No commitment
                </p>
              </div>
              <div style="background: #fef3f2; padding: 15px; border-radius: 6px;">
                <strong style="color: #991b1b;">🆓 Free Plan</strong>
                <p style="color: #991b1b; margin: 5px 0; font-size: 14px;">
                  Get 3 free credits every month • Perfect for light usage
                </p>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pixelift.pl/pricing"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Pricing Options →
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Questions? We're here to help! Reply to this email or contact
              <a href="mailto:support@pixelift.pl" style="color: #10b981;">support@pixelift.pl</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Upscaling</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">Website</a> •
              <a href="https://pixelift.pl/pricing" style="color: #10b981; text-decoration: none;">Pricing</a> •
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Credits low email sent to ${data.userEmail} (${data.creditsRemaining} credits remaining)`);
    return true;
  } catch (error) {
    console.error('Failed to send credits low email:', error);
    return false;
  }
}

/**
 * Send notification when user's credits are depleted
 */
export async function sendCreditsDepletedEmail(data: CreditsDepletedEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: 'Your Pixelift credits are empty - Top up to continue',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Out of Credits</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Hi ${data.userName},
            </p>

            <div style="background: #fef3f2; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #991b1b; margin: 0; font-size: 16px;">
                <strong>⚠️ Your credits have been depleted.</strong> You'll need to purchase more credits to continue processing images.
              </p>
            </div>

            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📊 Your Usage Summary</h3>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Total images processed:</strong> ${data.totalImagesProcessed}</p>
              <p style="margin: 8px 0; color: #4b5563;"><strong>Current credits:</strong> 0</p>
            </div>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Ready to continue? Choose the plan that works best for you:
            </p>

            <div style="margin: 25px 0;">
              <div style="background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <strong style="color: #1e40af; font-size: 18px;">💎 Most Popular</strong>
                    <p style="color: #1e40af; margin: 5px 0 0 0; font-size: 14px;">
                      Subscription: 200 credits/month for $36.40
                    </p>
                  </div>
                </div>
              </div>
              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #065f46;">⚡ One-Time: 500 credits</strong>
                <p style="color: #065f46; margin: 5px 0; font-size: 14px;">
                  $100.00 • $0.20/credit • Never expires
                </p>
              </div>
              <div style="background: #fef3f2; padding: 15px; border-radius: 6px;">
                <strong style="color: #991b1b;">🆓 Free Plan</strong>
                <p style="color: #991b1b; margin: 5px 0; font-size: 14px;">
                  Wait until next month for 3 free credits
                </p>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pixelift.pl/pricing"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Buy Credits Now →
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Need help choosing? Contact us at
              <a href="mailto:support@pixelift.pl" style="color: #10b981;">support@pixelift.pl</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Upscaling</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">Website</a> •
              <a href="https://pixelift.pl/pricing" style="color: #10b981; text-decoration: none;">Pricing</a> •
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Credits depleted email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send credits depleted email:', error);
    return false;
  }
}

/**
 * Send congratulations email after user's first successful upload
 */
export async function sendFirstUploadEmail(data: FirstUploadEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Pixelift <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: '🎉 Congratulations on your first upscaled image!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; font-size: 60px; margin-bottom: 20px;">🎉</div>

            <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Congratulations, ${data.userName}!</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px; text-align: center;">
              You just processed your first image with Pixelift's AI technology.
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px; text-align: center;">
              <p style="color: #065f46; margin: 0; font-size: 18px; font-weight: 600;">
                See the difference AI can make?
              </p>
              <p style="color: #065f46; margin: 10px 0 0 0; font-size: 14px;">
                That's just the beginning of what you can achieve!
              </p>
            </div>

            <h3 style="color: #1f2937; margin-top: 40px; font-size: 20px;">💡 Tips for Even Better Results</h3>

            <div style="margin: 20px 0;">
              <div style="background: #fef3f2; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #991b1b;">👤 Portrait Mode</strong>
                <p style="color: #991b1b; margin: 5px 0; font-size: 14px;">
                  Perfect for faces and people - enhances skin tones and details
                </p>
              </div>
              <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #065f46;">🏞️ Landscape Mode</strong>
                <p style="color: #065f46; margin: 5px 0; font-size: 14px;">
                  Ideal for nature photos, cityscapes, and outdoor scenes
                </p>
              </div>
              <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                <strong style="color: #1e40af;">⚡ Maximum Quality</strong>
                <p style="color: #1e40af; margin: 5px 0; font-size: 14px;">
                  For professional work requiring the absolute best quality
                </p>
              </div>
              <div style="background: #fef9e7; padding: 15px; border-radius: 6px;">
                <strong style="color: #92400e;">📦 Batch Upload</strong>
                <p style="color: #92400e; margin: 5px 0; font-size: 14px;">
                  Process up to 50 images at once with the same settings
                </p>
              </div>
            </div>

            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="margin: 0; color: #4b5563;">
                <strong>Credits remaining:</strong>
                <span style="color: #10b981; font-size: 24px; font-weight: 600;">${data.creditsRemaining}</span>
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pixelift.pl/dashboard"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Process More Images →
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
              <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Love the results? We'd love to hear from you!<br />
                Reply to this email and share your feedback.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Upscaling</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">Website</a> •
              <a href="https://pixelift.pl/pricing" style="color: #10b981; text-decoration: none;">Pricing</a> •
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`First upload email sent to ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send first upload email:', error);
    return false;
  }
}

/**
 * Send purchase confirmation email when user buys credits or subscription
 */
export async function sendPurchaseConfirmationEmail(data: PurchaseConfirmationEmailData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping email');
    return false;
  }

  const isSubscription = !!data.nextBillingDate;

  try {
    await resend.emails.send({
      from: 'Pixelift <support@pixelift.pl>',
      to: [data.userEmail],
      replyTo: 'support@pixelift.pl',
      subject: `Purchase Confirmation - ${data.planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; font-size: 60px; margin-bottom: 20px;">✅</div>

            <h2 style="color: #1f2937; margin-top: 0; text-align: center;">Thank You for Your Purchase!</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Hi ${data.userName},
            </p>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Your payment has been successfully processed. Your credits are now available in your account.
            </p>

            <!-- Receipt Details -->
            <div style="background: #f3f4f6; padding: 30px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; text-align: center;">Receipt</h3>

              <div style="border-bottom: 1px solid #d1d5db; padding-bottom: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280;">Plan:</span>
                  <strong style="color: #1f2937;">${data.planName}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280;">Credits Added:</span>
                  <strong style="color: #10b981;">${data.creditsAdded}</strong>
                </div>
                ${isSubscription ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span style="color: #6b7280;">Billing Cycle:</span>
                  <strong style="color: #1f2937;">Monthly</strong>
                </div>
                ` : ''}
              </div>

              <div style="display: flex; justify-content: space-between; padding-top: 15px;">
                <span style="color: #1f2937; font-size: 18px; font-weight: 600;">Total Paid:</span>
                <strong style="color: #1f2937; font-size: 18px;">${data.currency}${data.amountPaid.toFixed(2)}</strong>
              </div>

              <p style="color: #6b7280; font-size: 12px; margin: 15px 0 0 0; text-align: center;">
                Transaction ID: ${data.transactionId}
              </p>
            </div>

            ${isSubscription ? `
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #1e40af; margin: 0; font-size: 15px;">
                <strong>📅 Next Billing Date:</strong> ${new Date(data.nextBillingDate!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p style="color: #1e40af; margin: 10px 0 0 0; font-size: 13px;">
                Your subscription will automatically renew. You can cancel anytime from your dashboard.
              </p>
            </div>
            ` : `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <p style="color: #065f46; margin: 0; font-size: 15px;">
                <strong>✨ Your credits are ready to use!</strong>
              </p>
              <p style="color: #065f46; margin: 10px 0 0 0; font-size: 13px;">
                These credits never expire. Use them whenever you need.
              </p>
            </div>
            `}

            <div style="text-align: center; margin: 40px 0;">
              <a href="https://pixelift.pl/dashboard"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Start Processing Images →
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
              <p style="color: #6b7280; font-size: 14px;">
                Need help or have questions? Contact us at
                <a href="mailto:support@pixelift.pl" style="color: #10b981; text-decoration: none;">support@pixelift.pl</a>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Upscaling</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">Website</a> •
              <a href="https://pixelift.pl/pricing" style="color: #10b981; text-decoration: none;">Pricing</a> •
              <a href="https://pixelift.pl/support" style="color: #10b981; text-decoration: none;">Support</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Purchase confirmation email sent to ${data.userEmail} for ${data.planName}`);
    return true;
  } catch (error) {
    console.error('Failed to send purchase confirmation email:', error);
    return false;
  }
}
