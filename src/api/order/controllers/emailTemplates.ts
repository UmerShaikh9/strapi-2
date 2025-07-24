// Email template for order confirmation (with inline CSS)

import { IAddress } from "./orderUtils";

interface OrderItem {
    name: string;
    price: string;
    image: string;
    quantity?: number;
}

interface OrderEmailDetails {
    orderNumber: string;
    orderDate: string;
    totalAmount: string;
    customerName: string;
    shippingAddress: IAddress;
    billingAddress: IAddress;
    items: OrderItem[];
    subTotal?: string;
    discount?: string;
    shippingCharges?: Number;
}

export function generateOrderConfirmationEmail(details: OrderEmailDetails): string {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
 <meta charset="UTF-8" />
 <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
 <!--[if !mso]><!-- -->
 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 <!--<![endif]-->
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
 <meta name="x-apple-disable-message-reformatting" />
 <link href="https://fonts.googleapis.com/css?family=Outfit:ital,wght@0,400;0,500;0,600" rel="stylesheet" />
 <title>Order Confirmation</title>
 <style>
 html, body { margin: 0 !important; padding: 0 !important; min-height: 100% !important; width: 100% !important; -webkit-font-smoothing: antialiased; }
         * { -ms-text-size-adjust: 100%; }
         #outlook a { padding: 0; }
         .ReadMsgBody, .ExternalClass { width: 100%; }
         .ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height: 100%; }
         table, td, th { mso-table-lspace: 0 !important; mso-table-rspace: 0 !important; border-collapse: collapse; }
         u + .body table, u + .body td, u + .body th { will-change: transform; }
         body, td, th, p, div, li, a, span { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-line-height-rule: exactly; }
         img { border: 0; outline: 0; line-height: 100%; text-decoration: none; -ms-interpolation-mode: bicubic; }
         a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
         .body .pc-project-body { background-color: transparent !important; }
         @media (min-width: 621px) {
             .pc-lg-hide {  display: none; } 
             .pc-lg-bg-img-hide { background-image: none !important; }
         }
 </style>
 <style>
 @media (max-width: 620px) {
 .pc-project-body {min-width: 0px !important;}
 .pc-project-container {width: 100% !important;}
 .pc-sm-hide, .pc-w620-gridCollapsed-1 > tbody > tr > .pc-sm-hide {display: none !important;}
 .pc-sm-bg-img-hide {background-image: none !important;}
 table.pc-w620-spacing-0-0-28-0 {margin: 0px 0px 28px 0px !important;}
 td.pc-w620-spacing-0-0-28-0,th.pc-w620-spacing-0-0-28-0{margin: 0 !important;padding: 0px 0px 28px 0px !important;}
 .pc-w620-padding-0-0-0-0 {padding: 0px 0px 0px 0px !important;}
 .pc-w620-padding-28-28-2-28 {padding: 28px 28px 2px 28px !important;}
 table.pc-w620-spacing-0-0-0-0 {margin: 0px 0px 0px 0px !important;}
 td.pc-w620-spacing-0-0-0-0,th.pc-w620-spacing-0-0-0-0{margin: 0 !important;padding: 0px 0px 0px 0px !important;}
 .pc-w620-font-size-30px {font-size: 30px !important;}
 .pc-w620-line-height-40px {line-height: 40px !important;}
 .pc-w620-width-fill {width: 100% !important;}
 .pc-w620-width-100pc {width: 100% !important;}
 .pc-w620-padding-20-20-0-20 {padding: 20px 20px 0px 20px !important;}
 .pc-w620-height-auto {height: auto !important;}
 .pc-w620-font-size-16px {font-size: 16px !important;}
 .pc-w620-font-size-14px {font-size: 14px !important;}
 .pc-w620-padding-20-20-20-20 {padding: 20px 20px 20px 20px !important;}
 .pc-w620-padding-28-28-28-28 {padding: 28px 28px 28px 28px !important;}
 .pc-w620-padding-0-0-15-0 {padding: 0px 0px 15px 0px !important;}
 table.pc-w620-spacing-0-16-12-0 {margin: 0px 16px 12px 0px !important;}
 td.pc-w620-spacing-0-16-12-0,th.pc-w620-spacing-0-16-12-0{margin: 0 !important;padding: 0px 16px 12px 0px !important;}
 div.pc-w620-align-left,th.pc-w620-align-left,a.pc-w620-align-left,td.pc-w620-align-left {text-align: left !important;text-align-last: left !important;}
 table.pc-w620-align-left{float: none !important;margin-right: auto !important;margin-left: 0 !important;}
 img.pc-w620-align-left{margin-right: auto !important;margin-left: 0 !important;}
 .pc-w620-width-102 {width: 102px !important;}
 img.pc-w620-width-102-min {min-width: 102px !important;}
 .pc-w620-height-102 {height: 102px !important;}
 table.pc-w620-spacing-0-0-4-0 {margin: 0px 0px 4px 0px !important;}
 td.pc-w620-spacing-0-0-4-0,th.pc-w620-spacing-0-0-4-0{margin: 0 !important;padding: 0px 0px 4px 0px !important;}
 .pc-w620-line-height-26px {line-height: 26px !important;}
 .pc-w620-padding-16-28-16-28 {padding: 16px 28px 16px 28px !important;}
 .pc-w620-width-auto {width: auto !important;}
 .pc-w620-fontSize-16 {font-size: 16px !important;}
 .pc-w620-lineHeight-163pc {line-height: 163% !important;}
 .pc-w620-line-height-163pc {line-height: 163% !important;}
 .pc-w620-font-size-22px {font-size: 22px !important;}
 .pc-w620-line-height-145pc {line-height: 145% !important;}
 .pc-w620-padding-35-35-35-35 {padding: 35px 35px 35px 35px !important;}
 table.pc-w620-spacing-0-0-20-0 {margin: 0px 0px 20px 0px !important;}
 td.pc-w620-spacing-0-0-20-0,th.pc-w620-spacing-0-0-20-0{margin: 0 !important;padding: 0px 0px 20px 0px !important;}
 .pc-w620-itemsSpacings-20-0 {padding-left: 10px !important;padding-right: 10px !important;padding-top: 0px !important;padding-bottom: 0px !important;}
 .pc-w620-gridCollapsed-1 > tbody,.pc-w620-gridCollapsed-1 > tbody > tr,.pc-w620-gridCollapsed-1 > tr {display: inline-block !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > tr > td,.pc-w620-gridCollapsed-1 > tr > td {display: block !important;width: auto !important;padding-left: 0 !important;padding-right: 0 !important;margin-left: 0 !important;}
 .pc-w620-gridCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-gridCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-first > .pc-grid-td-first,.pc-w620-gridCollapsed-1 > .pc-grid-tr-first > .pc-grid-td-first {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-1 > tbody > .pc-grid-tr-last > .pc-grid-td-last,.pc-w620-gridCollapsed-1 > .pc-grid-tr-last > .pc-grid-td-last {padding-bottom: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-first > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-first > td {padding-top: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > .pc-grid-tr-last > td,.pc-w620-gridCollapsed-0 > .pc-grid-tr-last > td {padding-bottom: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-first,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-first {padding-left: 0 !important;}
 .pc-w620-gridCollapsed-0 > tbody > tr > .pc-grid-td-last,.pc-w620-gridCollapsed-0 > tr > .pc-grid-td-last {padding-right: 0 !important;}
 .pc-w620-tableCollapsed-1 > tbody,.pc-w620-tableCollapsed-1 > tbody > tr,.pc-w620-tableCollapsed-1 > tr {display: block !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr {width: 100% !important;}
 .pc-w620-tableCollapsed-1 > tbody > tr > td,.pc-w620-tableCollapsed-1 > tr > td {display: block !important;width: auto !important;}
 .pc-w620-tableCollapsed-1.pc-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 .pc-w620-tableCollapsed-1.pc-w620-width-fill > tbody > tr > td,.pc-w620-tableCollapsed-1.pc-w620-width-fill > tr > td {width: 100% !important;box-sizing: border-box !important;}
 }
 @media (max-width: 520px) {
 .pc-w520-padding-30-30-30-30 {padding: 30px 30px 30px 30px !important;}
 }
 </style>
 <!--[if !mso]><!-- -->
 <style>
 @font-face { font-family: 'Outfit'; font-style: normal; font-weight: 500; src: url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4QK1O4i0FQ.woff') format('woff'), url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4QK1O4i0Ew.woff2') format('woff2'); } @font-face { font-family: 'Outfit'; font-style: normal; font-weight: 600; src: url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4e6yO4i0FQ.woff') format('woff'), url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4e6yO4i0Ew.woff2') format('woff2'); } @font-face { font-family: 'Outfit'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4i0FQ.woff') format('woff'), url('https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1O4i0Ew.woff2') format('woff2'); }
 </style>
 <!--<![endif]-->
 <!--[if mso]>
    <style type="text/css">
        .pc-font-alt {
            font-family: Arial, Helvetica, sans-serif !important;
        }
    </style>
    <![endif]-->
 <!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
</head>
<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; font-weight: normal; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #f5f5f5;" bgcolor="#f5f5f5">
 <table class="pc-project-body" style="table-layout: fixed; width: 100%; min-width: 600px; background-color: #f5f5f5;" bgcolor="#f5f5f5" border="0" cellspacing="0" cellpadding="0" role="presentation">
  <tr>
   <td align="center" valign="top" style="width:auto;">
    <table class="pc-project-container" align="center" style="width: 600px; max-width: 600px;" border="0" cellpadding="0" cellspacing="0" role="presentation">
     <tr>
      <td style="padding: 20px 0px 20px 0px;" align="left" valign="top">
       <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Header Logo -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-28-28-2-28" style="padding: 24px 40px 0px 40px; height: unset; background-color: #00332f;" bgcolor="#00332f">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td valign="top" align="center">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" align="center" style="margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" style="height: unset;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                       <tr>
                        <td>
                         <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                           <td class="pc-w620-spacing-0-0-28-0" align="center" valign="top" style="padding: 0px 0px 32px 0px; height: auto;">
                            <img src="https://banarasi-baithak-files.s3.ap-south-1.amazonaws.com/email-template-images/image-1745994313536-1c7ff68e.png" alt="Banarasi Baithak Logo" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; border: 0;" />
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
            </td>
           </tr>
          </table>
          <!-- END MODULE: Header Logo -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Header -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-28-28-28-28" style="padding: 10px 40px 10px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td align="center" valign="top" style="padding: 0px 0px 12px 0px; height: auto;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
                    <tr>
                     <td valign="top" align="center">
                      <div class="pc-font-alt" style="text-decoration: none;">
                       <div style="font-size:30px;line-height:40px;text-align:center;text-align-last:center;color:#000000;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.2px;font-style:normal;">
                        <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 30px; line-height: 40px; font-weight: 300;" class="pc-w620-font-size-30px pc-w620-line-height-40px">Thank You for Your Order!</span>
                        </div>
                       </div>
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
                      <div class="pc-font-alt" style="text-decoration: none;">
                       <div style="font-size:15px;line-height:22px;text-align:center;text-align-last:center;color:#000000;font-family:'Outfit', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:-0.2px;">
                        <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;">
                         <span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-weight: 300; font-size: 15px; line-height: 156%;">Hi </span>
                         <span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; color: rgb(0, 51, 47); font-weight: 300; font-size: 15px; line-height: 156%;">${details.customerName}!</span>
                         <span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-weight: 300; font-size: 15px; line-height: 156%;"> Your Banarasi Baithak order <span style="font-weight: 400; font-size: 15px;">IN#-${details.orderNumber}</span> is confirmed. Thank you for shopping with us!</span>
                        </div>
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
          <!-- END MODULE: Header -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Ornament -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-0-0-15-0" style="height: unset; background-color: #ffffff;" bgcolor="#ffffff">
               </td>
              </tr>
             </table>
            </td>
           </tr>
          </table>
          <!-- END MODULE: Ornament -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Detail Item Order -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-16-28-16-28" style="padding: 5px 40px 24px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td class="pc-w620-spacing-0-0-0-0" align="center" valign="top" style="padding: 0px 0px 10px 0px; height: auto;">
                   <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                    <tr>
                     <td valign="top" class="pc-w620-padding-0-0-0-0" align="left">
                      <div class="pc-font-alt" style="text-decoration: none;">
                       <div style="font-size:30px;line-height:40px;text-align:left;text-align-last:left;color:#240300;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.6px;font-style:normal;">
                        <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 24px; line-height: 128%; font-weight: 500;" class="pc-w620-font-size-30px pc-w620-line-height-40px">Your Product Details</span>
                        </div>
                       </div>
                      </div>
                     </td>
                    </tr>
                   </table>
                  </td>
                 </tr>
                </table>
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td style="padding: 0px 0px 8px 0px;">
                   <table class="pc-width-fill pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
                    <tbody>
                    ${details.items
                        .map(
                            (item) => `
                     <tr style="margin-bottom: 18px; display: block;">
                      <td align="left" valign="middle" style="padding: 0px 0px 0px 0px; width: 86px;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-16-12-0 pc-w620-align-left" align="left" valign="top">
                          <img src="${item.image}" class="pc-w620-width-102 pc-w620-height-102 pc-w620-width-102-min pc-w620-align-left" width="86" height="auto" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 100%; height: auto; border-radius: 8px 8px 8px 8px; border: 0;" />
                         </td>
                        </tr>
                       </table>
                      </td>
                      <td align="left" valign="middle" style="padding: 10px 10px 20px 10px; height: auto;">
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-spacing-0-0-4-0 pc-w620-align-left" align="left" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-100pc pc-w620-align-left" width="100%" align="left">
                           <tr>
                            <td valign="top" class="pc-w620-padding-0-0-0-0 pc-w620-align-left" align="left">
                             <div class="pc-font-alt pc-w620-align-left" style="text-decoration: none;">
                              <div style="font-size:15px;line-height:22px;text-align:left;text-align-last:left;color:#240300;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:0px;font-style:normal;">
                               <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 15px; line-height: 22px; font-weight: 500;">${item.name}</span></div>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-align-left" align="left" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-100pc pc-w620-align-left" width="100%" align="left">
                           <tr>
                            <td valign="top" class="pc-w620-align-left" align="left">
                             <div class="pc-font-alt pc-w620-align-left" style="text-decoration: none;">
                              <div style="font-size:13px;line-height:20px;text-align:left;text-align-last:left;color:#240300;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.2px;font-style:normal;">
                               <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; font-weight: 400;">${item.price}</span></div>
                              </div>
                             </div>
                            </td>
                           </tr>
                          </table>
                         </td>
                        </tr>
                       </table>
                       <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                         <td class="pc-w620-align-left" align="left" valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-100pc pc-w620-align-left" width="100%" align="left">
                           <tr>
                            <td valign="top" class="pc-w620-align-left" align="left">
                             <div class="pc-font-alt pc-w620-align-left" style="text-decoration: none;">
                              <div style="font-size:13px;line-height:20px;text-align:left;text-align-last:left;color:#240300;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.2px;font-style:normal;">
                               <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 13px; line-height: 20px; font-weight: 400;">QTY : ${item.quantity || 1}</span></div>
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
                    `
                        )
                        .join("")}
                    </tbody>
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
          <!-- END MODULE: Detail Item Order -->
         </td>
        </tr>
        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Transactional 6 -->
          <table style="border-collapse: separate; border-spacing: 0px;" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
                           <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 0px 40px 20px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
             <table class="pc-width-fill pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
              <tbody>
               <tr align="left" valign="top">
                <td valign="top" style="width: 265px;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 10px 0px 0px;" align="left">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="left" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" width="100%">
                        <tr>
                         <td valign="top" align="left">
                          <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-163pc" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; color: #151515; text-align: left; text-align-last: left;">
                           <div style="font-size:13px;color:#151515;font-weight:400;">SUBTOTAL:</div>
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
                <td valign="top" style="width: 10%;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 0px 0px 10px;" align="left">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="left" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" width="100%">
                        <tr>
                         <td valign="top" align="left">
                          <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-163pc" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; color: #151515; text-align: left; text-align-last: left;">
                           <div style="font-size:13px;color:#151515;font-weight:400;text-align:right;">${details.subTotal}</div>
                         </td>
                        </tr>
                      </td>
                     </tr>
                    </table>
                   </td>
                  </tr>
                 </table>
                </td>
               </tr>
               <tr align="left" valign="top">
                <td valign="top" style="width: 265px;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 10px 0px 0px;" align="left">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="left" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" width="100%">
                        <tr>
                         <td valign="top" align="left">
                          <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-163pc" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 16px; font-weight: normal; color: #151515; text-align: left; text-align-last: left;">
                           <div style="font-size:13px;color:#151515;font-weight:400;">SHIPPING:</div>
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
                <td valign="top" style="width: 10%;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 0px 0px 10px;" align="left">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="left" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" width="100%">
                        <tr>
                         <td valign="top" align="left">
                          <div class="pc-font-alt pc-w620-fontSize-16 pc-w620-lineHeight-163pc" style="line-height: 156%; letter-spacing: -0.2px; font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: normal; color: #151515; text-align: left; text-align-last: left;">
                            <div style="font-size:13px;color:#151515;font-weight:400;text-align:right;">${details.shippingCharges || "0"}</div>
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
               <tr align="left" valign="top">
               </tr>
              </tbody>
             </table>
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td height="20" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
              </tr>
             </table>
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td valign="top">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                  <td valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 2px solid #e5e5e5;">&nbsp;</td>
                 </tr>
                </table>
               </td>
              </tr>
             </table>
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td height="0" style="line-height: 1px; font-size: 1px;">&nbsp;</td>
              </tr>
             </table>
             <table class="pc-width-fill pc-w620-tableCollapsed-0" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
              <tbody>
               <tr align="right" valign="top">
                <td valign="top" style="width: 90%;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 10px 0px 0px;" align="right">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="left" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" align="left">
                        <tr>
                         <td valign="top" align="right">
                          <div class="pc-font-alt" style="text-decoration: none;">
                           <div style="font-size:22px;line-height:145%;text-align:right;text-align-last:right;color:#151515;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.4px;font-style:normal;">
                            <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 13px; line-height: 145%; font-weight: 600;" class="pc-w620-font-size-22px pc-w620-line-height-145pc">TOTAL:</span>
                            </div>
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
                <td valign="top" style="width: 10%;">
                 <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                   <td style="padding: 0px 0px 0px 10px;" align="right">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                     <tr>
                      <td align="right" valign="top">
                       <table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-width-auto" width="100%">
                        <tr>
                         <td valign="top" align="right">
                          <div class="pc-font-alt" style="text-decoration: none;">
                           <div style="font-size:22px;line-height:145%;text-align:right;text-align-last:right;color:#151515;font-family:'Outfit', Arial, Helvetica, sans-serif;letter-spacing:-0.4px;font-style:normal;">
                            <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-size: 13px; line-height: 145%; font-weight: 600;" class="pc-w620-font-size-22px pc-w620-line-height-145pc">${details.totalAmount}</span>
                            </div>
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
              </tbody>
             </table>
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td align="center" valign="top" style="padding: 0px 0px 14px 0px; height: auto;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
                 <tr>
                  <td valign="top" align="center" style="padding: 10px 0px 0px 0px; height: auto;">
                   <div class="pc-font-alt" style="text-decoration: none;">
                    <div style="font-size:14px;line-height:143%;text-align:center;text-align-last:center;color:#000000cc;font-family:'Outfit', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:-0.2px;">
                     <div style="font-family:'Outfit', Arial, Helvetica, sans-serif;"><span style="font-family: 'Outfit', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 14px; line-height: 143%;">Shipping timelines vary by location and garment. Please check the specific product page for details.</span>
                     </div>
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
          <!-- END MODULE: Transactional 6 -->
         </td>
        </tr>

        <tr>
         <td valign="top">
          <!-- BEGIN MODULE: Header -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
             <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
              <tr>
               <td valign="top" class="pc-w620-padding-28-28-28-28" style="padding: 0px 40px 40px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
                 <!-- Addresses -->
                <table class="pc-width-hug pc-w620-width-fill pc-w620-tableCollapsed-1" border="0" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#ffffff" style="border-collapse: separate; border-spacing: 0; background-color:#ffffff;">
                 <tbody>
                  <tr align="left" valign="left">
                   <td style="background: #ffffff; padding: 0px; border-radius: 4px;">
                    <!-- Shipping Address content -->
                    <div style="font-size:16px;font-weight:600;color:#240300;margin-bottom:6px;">Shipping Address</div>
                    <div style="font-size:13px;color:#240300;font-weight:500;">${details.shippingAddress.name}</div>
                    <div style="font-size:13px;color:#240300;">${details.shippingAddress.address}</div>
                    <div style="font-size:13px;color:#240300;">${details.shippingAddress.city}, ${details.shippingAddress.state} ${details.shippingAddress.pincode}</div>
                    <div style="font-size:13px;color:#240300;">${details.shippingAddress.country || "India"}</div>
                    <div style="font-size:13px;color:#240300;">Email: ${details.shippingAddress.email}</div>
                    <div style="font-size:13px;color:#240300;">Phone: ${details.shippingAddress.phone}</div>
                  </td>
                  </tr>
                  <tr>
                   <td style="height: 20px; background-color: #ffffff;">&nbsp;</td>
                  </tr>
                  <tr align="left" valign="left">
                   <td style="background: #ffffff; padding: 0px; border-radius: 4px;">
                    <!-- Billing Address content -->
                    <div style="font-size:16px;font-weight:600;color:#240300;margin-bottom:6px;">Billing Address</div>
                    <div style="font-size:13px;color:#240300;font-weight:500;">${details.billingAddress.name}</div>
                    <div style="font-size:13px;color:#240300;">${details.billingAddress.address}</div>
                    <div style="font-size:13px;color:#240300;">${details.billingAddress.city}, ${details.billingAddress.state} ${details.billingAddress.pincode}</div>
                    <div style="font-size:13px;color:#240300;">${details.billingAddress.country || "India"}</div>
                    <div style="font-size:13px;color:#240300;">Email: ${details.billingAddress.email}</div>
                    <div style="font-size:13px;color:#240300;">Phone: ${details.billingAddress.phone}</div>
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
          <!-- END MODULE: Header -->
         </td>
        </tr>
        
        <tr>  
         <td valign="top">
          <!-- BEGIN MODULE: Footer -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
           <tr>
            <td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 40px 40px 40px 40px; height: unset; background-color: #00332f;" bgcolor="#00332f">
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td class="pc-w620-spacing-0-0-20-0" align="center" valign="top" style="padding: 0px 0px 20px 0px; height: auto;">
                <img src="https://banarasi-baithak-files.s3.ap-south-1.amazonaws.com/email-template-images/image-1745994313536-1c7ff68e.png" width="164" height="47" alt="Banarasi Baithak Logo" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 164px; height: auto; max-width: 100%; border: 0;" />
               </td>
              </tr>
             </table>
             
             <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
               <td align="center" valign="top" style="padding: 0px 0px 14px 0px; height: auto;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
                  <tr>
                        <td align="center" valign="top" style="line-height: 1;">
                            <img src="https://banarasi-baithak-files.s3.ap-south-1.amazonaws.com/email-template-images/193c7e94406b9a9160b8842fcba96582.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" alt="instagram" />
                        </td>
                  </tr>
                 <tr>
                  <td valign="top" align="center">
                   <div class="pc-font-alt" style="text-decoration: none;">
                    <div style="font-size:13px;color:#fff;opacity:0.8; font-weight:300; margin-top:4px;">Gurgaon, Haryana. 122002</div>
                    <div style="font-size:13px;color:#fff;opacity:0.8; font-weight:300; margin-top:4px;">Email: sales@banarasibaithak.com</div>
                    <div style="font-size:13px;color:#fff;opacity:0.8; font-weight:300;">Phone: +91 78382 80041, +91 99110 74381</div>
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
          <!-- END MODULE: Footer -->
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
}

export function generateAdminOrderNotificationEmail(details: OrderEmailDetails): string {
    return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
 <meta charset="UTF-8" />
 <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
 <meta http-equiv="X-UA-Compatible" content="IE=edge" />
 <meta name="viewport" content="width=device-width, initial-scale=1.0" />
 <title>New Order Notification</title>
 <style>
  body { font-family: 'Outfit', Arial, Helvetica, sans-serif; background: #f5f5f5; color: #222; }
  .container { background: #fff; max-width: 600px; margin: 30px auto; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px; }
  h1 { color: #00332f; font-size: 26px; margin-bottom: 12px; }
  h2 { color: #240300; font-size: 20px; margin-top: 24px; margin-bottom: 8px; }
  .order-info, .address, .items, .totals { margin-bottom: 18px; }
  .address-block { margin-bottom: 10px; }
  .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  .items-table th, .items-table td { border: 1px solid #eee; padding: 8px; text-align: left; }
  .items-table th { background: #f0f0f0; }
 </style>
</head>
<body>
  <div class="container">
    <h1>New Order Received</h1>
    <div class="order-info">
      <strong>Order Number:</strong> IN#-${details.orderNumber}<br/>
      <strong>Order Date:</strong> ${details.orderDate}<br/>
      <strong>Customer Name:</strong> ${details.customerName}<br/>
    </div>
    <h2>Customer Contact</h2>
    <div class="address-block">
      <strong>Email:</strong> ${details.shippingAddress.email}<br/>
      <strong>Phone:</strong> ${details.shippingAddress.phone}
    </div>
    <h2>Shipping Address</h2>
    <div class="address address-block">
      ${details.shippingAddress.name}<br/>
      ${details.shippingAddress.address}<br/>
      ${details.shippingAddress.city}, ${details.shippingAddress.state} ${details.shippingAddress.pincode}<br/>
      ${details.shippingAddress.country || "India"}
    </div>
    <h2>Billing Address</h2>
    <div class="address address-block">
      ${details.billingAddress.name}<br/>
      ${details.billingAddress.address}<br/>
      ${details.billingAddress.city}, ${details.billingAddress.state} ${details.billingAddress.pincode}<br/>
      ${details.billingAddress.country || "India"}
    </div>
    <h2>Order Items</h2>
    <table class="items-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${details.items
            .map(
                (item) => `
          <tr>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>${item.quantity || 1}</td>
          </tr>
        `
            )
            .join("")}
      </tbody>
    </table>
    <h2>Order Summary</h2>
    <table class="totals-table" style=" width: 100%; margin:0 auto 16px auto;">
      <tr>
        <td class="label" style="text-align:left; color:#555;">Subtotal:</td>
        <td class="value" style="text-align:right;">${details.subTotal || "-"}</td>
      </tr>
      <tr>
        <td class="label" style="text-align:left; color:#555;">Shipping:</td>
        <td class="value" style="text-align:right;">${details.shippingCharges || "0"}</td>
      </tr>
      <tr>
        <td class="label" style="text-align:left; font-weight:700; border-top:2px solid #eee; padding-top:8px;">Total:</td>
        <td class="value" style="text-align:right; font-weight:700; border-top:2px solid #eee; padding-top:8px;">${details.totalAmount}</td>
      </tr>
    </table>
    <div style="margin-top: 32px; color: #888; font-size: 13px;">This is an automated notification for a new order placed on Banarasi Baithak.</div>
  </div>
</body>
</html>`;
}
