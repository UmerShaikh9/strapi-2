// This file is intentionally left empty as we're reverting to the previous implementation
// where utility functions were defined directly in the controller files

import path from "path";
import { factories } from "@strapi/strapi";

interface OrderDetails {
    orderNumber: string;
    orderDate: string;
    totalAmount: string;
    customerName: string;
    shippingAddress: string;
    items: Array<{
        name: string;
        price: string;
        image: string;
    }>;
    // subtotal: string;
    // discount: string;
    // deliveryFee: string;
}

const generateOrderConfirmationEmail = (orderDetails: OrderDetails): string => {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <link href="https://fonts.googleapis.com/css?family=Outfit:ital,wght@0,400;0,400;0,500;0,600" rel="stylesheet" />
  <title>Banarasi Baithak</title>
  <style>
    /* ... (keep all existing styles) ... */
  </style>
</head>
<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; font-weight: normal; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #e3dad5;" bgcolor="#e3dad5">
  <table class="pc-project-body" style="table-layout: fixed; width: 100%; min-width: 600px; background-color: #e3dad5;" bgcolor="#e3dad5" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" valign="top" style="width:auto;">
        <table class="pc-project-container" align="center" style="width: 600px; max-width: 600px;" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px 0px 20px 0px;" align="left" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td valign="top">
                    <!-- Header Section -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                            <tr>
                              <td valign="top" class="pc-w620-padding-28-28-28-28" style="padding: 24px 40px 40px 40px; height: unset; background-color: #180000;" bgcolor="#180000">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td class="pc-w620-spacing-0-0-28-0" align="center" valign="top" style="padding: 0px 0px 32px 0px; height: auto;">
                                      <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/banarasi_logo_bd24b03479.png" width="164" height="47" alt="Banarasi Baithak Logo" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 164px; height: auto; max-width: 100%; border: 0;" />
                                    </td>
                                  </tr>
                                </table>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" valign="top" style="padding: 0px 0px 12px 0px; height: auto;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
                                        <tr>
                                          <td valign="top" align="center">
                                            <div class="pc-font-alt pc-w620-fontSize-30 pc-w620-lineHeight-40" style="line-height: 128%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 38px; font-weight: 500; color: #ffffff; text-align: center; text-align-last: center;">
                                              <div><span>Thank You for Your Order</span></div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" valign="top" style="padding: 0px 0px 12px 0px; height: auto;">
                                      <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
                                        <tr>
                                          <td valign="top" align="center">
                                            <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-26" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 19px; font-weight: normal; color: #ffffffcc; text-align: center; text-align-last: center;">
                                              <div><span>Your order's in. We're working to get it packed up and out the door. Expect a dispatch confirmation email soon.</span></div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                                <!-- Order Summary -->
                                <table class="pc-width-fill pc-w620-width-fill pc-w620-tableCollapsed-1" border="0" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#360000" style="border-collapse: separate; border-spacing: 0; width: 100%; background-color:#360000; border-radius: 8px 8px 8px 8px;">
                                  <tbody>
                                    <tr>
                                      <td class="pc-w620-width-100pc" valign="top" style="width: 176px; height: auto;">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                          <tr>
                                            <td style="padding: 20px 20px 20px 20px;" align="left">
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 8px 0px; height: auto;">
                                                    <div class="pc-font-alt pc-w620-fontSize-16px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 500; color: #ffcb65;">
                                                      <div><span>Summary</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 8px 0px; height: auto;">
                                                    <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 140%; letter-spacing: -0px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 500; color: #ff9065;">
                                                      <div><span>Ready to Ship</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 8px 0px; height: auto;">
                                                    <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; color: #ffffffcc;">
                                                      <div><span>#${orderDetails.orderNumber} • ${orderDetails.orderDate}</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top">
                                                    <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 600; color: #ffffff;">
                                                      <div><span>${orderDetails.totalAmount}</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                      <td class="pc-w620-width-100pc" valign="middle" style="width: 168px; height: auto;">
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                          <tr>
                                            <td style="padding: 20px 20px 20px 20px;" align="left">
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 12px 0px; height: auto;">
                                                    <div class="pc-font-alt pc-w620-fontSize-16px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 500; color: #ffcb65;">
                                                      <div><span>Shipping Address</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 8px 0px; height: auto;">
                                                    <div class="pc-font-alt pc-w620-fontSize-14px" style="line-height: 140%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: 600; color: #ffffff;">
                                                      <div><span>${orderDetails.customerName}</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                              <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                <tr>
                                                  <td valign="top" style="padding: 0px 0px 7px 0px; height: auto;">
                                                    <div class="pc-font-alt" style="line-height: 140%; letter-spacing: -0px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; color: #ffffffcc;">
                                                      <div><span>${orderDetails.shippingAddress}</span></div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- First ZigZag -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-0-0-15-0" style="height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                          <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/first_Zig_Zag_c930ceb63d.png" width="600" height="auto" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 100%; height: auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                    <!-- Order Items -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-16-28-16-28" style="padding: 40px 40px 24px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td class="pc-w620-spacing-0-0-0-0" align="center" valign="top" style="padding: 0px 0px 4px 0px; height: auto;">
                                <div class="pc-font-alt pc-w620-fontSize-30 pc-w620-lineHeight-40" style="line-height: 128%; letter-spacing: -0.6px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 32px; font-weight: 500; color: #1b110c; text-align: center; text-align-last: center;">
                                  <div><span>Your items in this order</span></div>
                                </div>
                              </td>
                            </tr>
                          </table>
                          ${orderDetails.items
                              .map((item, idx) => {
                                  console.log("item --->", idx, " ", item);
                                  return `
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                              <tr>
                                <td style="padding: 0px 0px 8px 0px;">
                                  <table class="pc-width-fill pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                                    <tbody>
                                      <tr>
                                        <td align="left" valign="middle" style="padding: 0px 0px 0px 0px; width: 86px;">
                                          <img src="${item.image}" width="86" height="86" alt="${item.name}" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 86px; height: 86px; border-radius: 8px; border: 0; object-fit: cover;" />
                                        </td>
                                        <td align="left" valign="middle" style="padding: 10px 10px 10px 10px; height: auto;">
                                          <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-26" style="line-height: 28px; letter-spacing: -0px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 600; color: #1b110c; text-align: left; text-align-last: left;">
                                            <div><span>${item.name}</span></div>
                                          </div>
                                          <div class="pc-font-alt" style="line-height: 24px; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 600; color: #039133; text-align: left; text-align-last: left;">
                                            <div><span>${item.price}</span></div>
                                          </div>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          `;
                              })
                              .join("")}
                          <!-- Order Total -->
                        
                      </tr>
                    </table>
                    <!-- Contact Section -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-28-28-0-28" style="padding: 28px 40px 20px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                          <table class="pc-width-fill pc-w620-gridCollapsed-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr class="pc-grid-tr-first pc-grid-tr-last">
                              <td class="pc-grid-td-first pc-w620-itemsSpacings-16-10" align="left" valign="top" style="width: 50%; padding-right: 20px;">
                                <table style="width: 100%;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="left" valign="top" style="padding: 12px 12px 12px 12px; height: auto; background-color: #fcedd0; border-radius: 12px 12px 12px 12px;">
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                          <td valign="middle" style="padding-right: 6px;">
                                            <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/open_Email_73b8f84e79.png" width="38" height="38" alt="Email" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 38px; height: 38px; border: 0;" />
                                          </td>
                                          <td valign="middle">
                                            <div class="pc-font-alt" style="line-height: 133%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 500; color: #1b1b1b;">
                                              <div><span>Email Us</span></div>
                                            </div>
                                            <div class="pc-font-alt" style="line-height: 143%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; color: #2a1e19;">
                                              <div><span>sales@banarasibaithak.com</span></div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td class="pc-grid-td-last pc-w620-itemsSpacings-16-10" align="left" valign="top" style="width: 50%; padding-left: 20px;">
                                <table style="width: 100%;" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="left" valign="top" style="padding: 12px 12px 12px 12px; height: auto; background-color: #fcedd0; border-radius: 12px 12px 12px 12px;">
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                        <tr>
                                          <td valign="middle" style="padding-right: 6px;">
                                            <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/phone_9da9f107cd.png" width="38" height="38" alt="Phone" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 38px; height: 38px; border: 0;" />
                                          </td>
                                          <td valign="middle">
                                            <div class="pc-font-alt" style="line-height: 133%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 500; color: #1b1b1b;">
                                              <div><span>Call Us</span></div>
                                            </div>
                                            <div class="pc-font-alt" style="line-height: 143%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 14px; font-weight: normal; color: #2a1e19;">
                                              <div><span>+1 (987) 654-32-13</span></div>
                                            </div>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- Second ZigZag -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-0-0-0-0" style="height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                          <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/second_Zig_Zag_png_38a2c4d9a1.png" width="600" height="auto" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 100%; height: auto; border: 0;" />
                        </td>
                      </tr>
                    </table>
                    <!-- Footer -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 40px 40px 40px 40px; height: unset; background-color: #1a110c;" bgcolor="#1a110c">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td class="pc-w620-spacing-0-0-20-0" align="center" valign="top" style="padding: 0px 0px 20px 0px; height: auto;">
                                <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/banarasi_logo_bd24b03479.png" width="164" height="47" alt="Banarasi Baithak Logo" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 164px; height: auto; max-width: 100%; border: 0;" />
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" style="padding: 0px 0px 20px 0px;">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td valign="middle" style="padding-right: 15px;">
                                      <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/facebook_4b276ff0f7.png" width="20" height="20" alt="Facebook" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" />
                                    </td>
                                    <td valign="middle">
                                      <img src="https://banarasi-baithak-all-images.s3.ap-south-1.amazonaws.com/instagram_f568c18fb4.png" width="20" height="20" alt="Instagram" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" />
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding: 0px 0px 14px 0px; height: auto;">
                                <div class="pc-font-alt" style="text-decoration: none;">
                                  <div style="font-size: 14px;mso-line-height-alt:20.02px;line-height: 20.02px;text-align:center;text-align-last:center;color:#ffffffcc;font-style:normal;font-weight:400;letter-spacing:-0.2px;">
                                    <div><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif;line-height: 143%;">1900 B, Beverly Park 2, DLF Phase 2, Gurgaon, Haryana. 122002</span></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendOrderConfirmationEmail = async (ctx) => {
    try {
        // Get the authenticated user ID
        const id = ctx.state.user?.id;
        console.log("user id", id);

        if (!id) {
            return ctx.unauthorized("You must be logged in to view the orders.");
        }

        const orders = await strapi.documents("api::order.order").findMany({
            filters: {
                User: {
                    id: id,
                },
            },
            sort: {
                createdAt: "desc",
            },
            populate: {
                Products: { populate: { Product: { populate: { Thumbnail: true } } } },
                User: true,
                Payment_Details: true,
            },
            status: "published",
        });

        let order = orders[0];
        if (!order) {
            throw new Error("No confirmed orders found for this user");
        }

        console.log("order details ", order);

        // Format order details for the email template
        const orderDetails: OrderDetails = {
            orderNumber: order.Payment_Details?.Order_Uid,
            orderDate: new Date(order.createdAt).toLocaleDateString(),
            totalAmount: formatPrice(order.Total_Price, order.Currency),
            customerName: `${order.User.email} `,
            shippingAddress: `${order.Address}, ${order.City}, ${order.State} ${order.Pincode}`,
            items: order.Products.map((item) => ({
                name: item.Product.Name,
                price: formatPrice(item.Price, order.Currency),
                image: item.Product.Thumbnail?.url,
            })),
        };

        console.log("orderDetails", orderDetails);

        // Generate the email HTML
        const emailHtml = generateOrderConfirmationEmail(orderDetails);

        // Send the email
        await strapi.plugins["email"].services.email.send({
            to: "umershaikh8805@gmail.com",
            subject: `Order Confirmation - #${order.Payment_Details?.Order_Uid}`,
            html: emailHtml,
        });

        return { success: true, message: "Order confirmation email sent successfully" };
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email");
    }
};

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
    sendOrderConfirmationEmail,
}));

const exchangeRates = {
    USD: 0.012,
    EUR: 0.011,
    INR: 1,
    CAD: 0.016,
    GBP: 0.0095,
    AUD: 0.018,
    JPY: 1.78,
    SGD: 0.016,
};

export const convertCurrency = ({ totalPriceINR, currency }) => {
    const exchangeRate = exchangeRates[currency] || 1; // Default to 1 if currency not found
    return (totalPriceINR * exchangeRate).toFixed(2);
};

export const formatPrice = (price, currency) => {
    return price.toLocaleString("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};
