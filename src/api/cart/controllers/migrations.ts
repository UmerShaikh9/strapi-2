import { factories } from "@strapi/strapi";

export default {
    migrateDiscriptionListToDescription: async (ctx) => {
        try {
            const documents = await strapi.db.query("api::rasa-page.rasa-page").findMany({
                populate: ["Description_List"],
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Description_List) {
                    const updatedEntry = { ...doc };
                    const blocks = doc.Description_List.map((item) => ({
                        type: "paragraph",
                        children: [{ text: item.Text }],
                    }));

                    if (blocks.length > 0) {
                        updatedEntry.Description = blocks;
                        await strapi.db.query("api::rasa-page.rasa-page").update({
                            where: { id: doc.id },
                            data: { Description: blocks },
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateDiscriptionListToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },

    migrateFaqAnswerToNewAnswer: async (ctx) => {
        try {
            const documents = await strapi.db.query("api::faq-page.faq-page").findMany({
                populate: ["FAQ_Sections.Questions.Answer"],
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.FAQ_Sections) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const section of doc.FAQ_Sections) {
                        if (section.Questions) {
                            for (const question of section.Questions) {
                                if (question.Answer) {
                                    const blocks = [
                                        {
                                            type: "paragraph",
                                            children: [{ text: question.Answer }],
                                        },
                                    ];
                                    question.newanswer = blocks;
                                    hasChanges = true;
                                }
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi.db.query("api::faq-page.faq-page").update({
                            where: { id: doc.id },
                            data: { FAQ_Sections: updatedEntry.FAQ_Sections },
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateFaqAnswerToNewAnswer:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },

    migrateNewAnswerToAnswer: async (ctx) => {
        try {
            const documents = await strapi.db.query("api::faq-page.faq-page").findMany({
                populate: ["FAQ_Sections.Questions.newanswer"],
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.FAQ_Sections) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const section of doc.FAQ_Sections) {
                        if (section.Questions) {
                            for (const question of section.Questions) {
                                if (question.newanswer) {
                                    question.Answer = question.newanswer[0]?.children[0]?.text || "";
                                    delete question.newanswer;
                                    hasChanges = true;
                                }
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi.db.query("api::faq-page.faq-page").update({
                            where: { id: doc.id },
                            data: { FAQ_Sections: updatedEntry.FAQ_Sections },
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateNewAnswerToAnswer:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },

    migrateHistoryDescriptionsToDescription: async (ctx) => {
        try {
            const documents = await strapi.db.query("api::history-and-lineage.history-and-lineage").findMany({
                populate: ["Section_1.Descriptions"],
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Section_1?.Descriptions) {
                    const updatedEntry = { ...doc };
                    const blocks = doc.Section_1.Descriptions.map((item) => ({
                        type: "paragraph",
                        children: [{ text: item.Text }],
                    }));

                    if (blocks.length > 0) {
                        updatedEntry.Section_1.Description = blocks;
                        await strapi.db.query("api::history-and-lineage.history-and-lineage").update({
                            where: { id: doc.id },
                            data: { Section_1: updatedEntry.Section_1 },
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateHistoryDescriptionsToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },

    migrateAboutCardDescriptionsToDescription: async (ctx) => {
        try {
            const documents = await strapi.db.query("api::history-and-lineage.history-and-lineage").findMany({
                populate: ["Section_1.About_Card.Descriptions"],
            });

            let updatedCount = 0;
            for (const doc of documents) {
                if (doc.Section_1?.About_Card) {
                    const updatedEntry = { ...doc };
                    let hasChanges = false;

                    for (const card of doc.Section_1.About_Card) {
                        if (card.Descriptions) {
                            const blocks = card.Descriptions.map((item) => ({
                                type: "paragraph",
                                children: [{ text: item.Text }],
                            }));

                            if (blocks.length > 0) {
                                card.Description = blocks;
                                hasChanges = true;
                            }
                        }
                    }

                    if (hasChanges) {
                        await strapi.db.query("api::history-and-lineage.history-and-lineage").update({
                            where: { id: doc.id },
                            data: { Section_1: updatedEntry.Section_1 },
                        });
                        updatedCount++;
                    }
                }
            }

            return ctx.send({
                message: `Migration completed. Updated ${updatedCount} documents.`,
            });
        } catch (error) {
            console.error("Error in migrateAboutCardDescriptionsToDescription:", error);
            return ctx.internalServerError("An error occurred during migration");
        }
    },
};
