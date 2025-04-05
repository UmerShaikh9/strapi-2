export default {
    async afterUpdate(event) {
        const { result } = event;

        console.log("result", result);
        // Check if the order status was updated to "CONFIRMED"
        if (result.Order_Status === "CONFIRMED") {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007bff;">Order Details</h2>
                    <p><strong>Name:</strong> ${result.Full_Name}</p>
                    <p><strong>Address:</strong> ${result.Address}, ${result.City}, ${result.State}, ${result.Pincode}, ${result.Country}</p>
                    <p><strong>Email:</strong> ${result.Email}</p>
                    <p><strong>Order ID:</strong> ${result.id}</p>
                    <p><strong>Price:</strong> ${result.Total_Price} ${result.Currency}</p>
                    <p><strong>Payment Status:</strong> ${result.Payment_Details?.Payment_Status === "COMPLETED" ? "Paid" : "Pending"}</p>
                    <p><strong>Alternate Number:</strong> ${result.Phone}</p>
                    <br> 
                </div>
            `;

            try {
                await strapi.plugins["email"].services.email.send({
                    to: "umershaikh8805@gmail.com", // Sending to customer's email
                    subject: `Order Details - #${result.id}`,
                    html: emailHtml,
                });

                console.log("Order confirmation email sent to:", result.Email);
            } catch (error) {
                console.error("Error sending order confirmation email:", error);
            }
        }
    },
};
