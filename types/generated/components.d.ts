import type { Schema, Struct } from '@strapi/strapi';

export interface BanarasiWeaveDesignPatternSection1
  extends Struct.ComponentSchema {
  collectionName: 'components_banarasi_weave_design_pattern_section_1s';
  info: {
    displayName: 'Section_1';
  };
  attributes: {
    Patterns: Schema.Attribute.Component<'history-lineage.about-card', true>;
  };
}

export interface BanarasiWeaveTechniqueSection1 extends Struct.ComponentSchema {
  collectionName: 'components_banarasi_weave_technique_section_1s';
  info: {
    description: '';
    displayName: 'Section_1';
  };
  attributes: {
    Title: Schema.Attribute.String;
    Weave_Technique_Details: Schema.Attribute.Component<
      'components.title-description',
      true
    >;
    Weave_Technique_Images: Schema.Attribute.Component<
      'components.image-title',
      true
    >;
  };
}

export interface BanarasiWeavesFabricOverview extends Struct.ComponentSchema {
  collectionName: 'components_banarasi_weaves_fabric_overviews';
  info: {
    description: '';
    displayName: 'Fabric_Overview';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Images: Schema.Attribute.Component<'components.image-title', true>;
    Title: Schema.Attribute.String;
  };
}

export interface BlogsBlogSection extends Struct.ComponentSchema {
  collectionName: 'components_blogs_blog_sections';
  info: {
    description: '';
    displayName: 'Blog_Section';
  };
  attributes: {
    Blog_Section: Schema.Attribute.Component<
      'banarasi-weaves.fabric-overview',
      true
    >;
    Description: Schema.Attribute.Text;
    Thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    Title: Schema.Attribute.String;
    Type: Schema.Attribute.String;
  };
}

export interface ComponentsBookAnAppointment extends Struct.ComponentSchema {
  collectionName: 'components_components_book_an_appointments';
  info: {
    description: '';
    displayName: 'Book_An_Appointment';
  };
  attributes: {
    Address: Schema.Attribute.Component<'elements.list', true>;
    Button: Schema.Attribute.Component<'elements.button', false>;
    Media: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ComponentsDescriptionList extends Struct.ComponentSchema {
  collectionName: 'components_components_description_lists';
  info: {
    displayName: 'Description_List';
  };
  attributes: {
    Description: Schema.Attribute.Component<'components.descriptions', true>;
  };
}

export interface ComponentsDescriptions extends Struct.ComponentSchema {
  collectionName: 'components_components_descriptions';
  info: {
    description: '';
    displayName: 'Description';
  };
  attributes: {
    Text: Schema.Attribute.Text;
  };
}

export interface ComponentsDropdownOption extends Struct.ComponentSchema {
  collectionName: 'components_components_dropdown_options';
  info: {
    displayName: 'Dropdown_Option';
  };
  attributes: {
    name: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

export interface ComponentsImageBox extends Struct.ComponentSchema {
  collectionName: 'components_components_image_boxes';
  info: {
    displayName: 'Image_Box';
  };
  attributes: {
    Image_Direction: Schema.Attribute.Enumeration<['Left', 'Right']>;
    Media: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String;
  };
}

export interface ComponentsImageTitle extends Struct.ComponentSchema {
  collectionName: 'components_components_image_titles';
  info: {
    displayName: 'Image_Title';
  };
  attributes: {
    Media: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.Text;
  };
}

export interface ComponentsInputField extends Struct.ComponentSchema {
  collectionName: 'components_components_input_fields';
  info: {
    displayName: 'Input_Field';
  };
  attributes: {
    Dropdown_Option: Schema.Attribute.Component<
      'components.dropdown-option',
      true
    >;
    label: Schema.Attribute.String;
    main_Type: Schema.Attribute.Enumeration<
      ['alphanumeric', 'email', 'simplePhoneNumber', 'pincode']
    >;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    placeholder: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<
      ['input', 'select', 'multiselect', 'checkbox', 'radio', 'textarea']
    >;
  };
}

export interface ComponentsSocialNetwork extends Struct.ComponentSchema {
  collectionName: 'components_components_social_networks';
  info: {
    displayName: 'Social_Network';
  };
  attributes: {
    Href: Schema.Attribute.String;
    Media: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String;
  };
}

export interface ComponentsTitleDescription extends Struct.ComponentSchema {
  collectionName: 'components_components_title_descriptions';
  info: {
    description: '';
    displayName: 'Title_Description';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Title: Schema.Attribute.String;
  };
}

export interface ContactPageContactDetails extends Struct.ComponentSchema {
  collectionName: 'components_contact_page_contact_details';
  info: {
    description: '';
    displayName: 'Contact_Details';
  };
  attributes: {
    Contact_Box: Schema.Attribute.Component<'elements.list-with-title', true>;
    Description: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface ContactPageContactForm extends Struct.ComponentSchema {
  collectionName: 'components_contact_page_contact_forms';
  info: {
    description: '';
    displayName: 'Contact_Form';
  };
  attributes: {
    Button: Schema.Attribute.Component<'elements.button', false>;
    Description: Schema.Attribute.Text;
    Input_Fields: Schema.Attribute.Component<'components.input-field', true>;
    Title: Schema.Attribute.String;
  };
}

export interface ContactPageSection1 extends Struct.ComponentSchema {
  collectionName: 'components_contact_page_section_1s';
  info: {
    description: '';
    displayName: 'Section_1';
  };
  attributes: {
    Contact_Details: Schema.Attribute.Component<
      'contact-page.contact-details',
      false
    >;
    Media: Schema.Attribute.Media<'images'>;
  };
}

export interface ContactPageSection2 extends Struct.ComponentSchema {
  collectionName: 'components_contact_page_section_2s';
  info: {
    description: '';
    displayName: 'Section_2';
  };
  attributes: {
    Media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface ElementsButton extends Struct.ComponentSchema {
  collectionName: 'components_elements_buttons';
  info: {
    description: '';
    displayName: 'Button';
  };
  attributes: {
    Href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_links';
  info: {
    description: '';
    displayName: 'Link';
  };
  attributes: {
    Href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    Media: Schema.Attribute.Media<'images' | 'files'>;
    SubLinks: Schema.Attribute.Component<'elements.sub-links', true>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsList extends Struct.ComponentSchema {
  collectionName: 'components_elements_lists';
  info: {
    description: '';
    displayName: 'List';
  };
  attributes: {
    Option: Schema.Attribute.Text;
  };
}

export interface ElementsListWithTitle extends Struct.ComponentSchema {
  collectionName: 'components_elements_list_with_titles';
  info: {
    description: '';
    displayName: 'List_With_Title';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Social_Networks: Schema.Attribute.Component<
      'components.social-network',
      true
    >;
    Title: Schema.Attribute.String;
  };
}

export interface ElementsLogoLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_logo_links';
  info: {
    displayName: 'Logo Link';
  };
  attributes: {
    Href: Schema.Attribute.String;
    Logo: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String;
  };
}

export interface ElementsSearchBar extends Struct.ComponentSchema {
  collectionName: 'components_elements_search_bars';
  info: {
    displayName: 'Search_Bar';
  };
  attributes: {
    Placeholder: Schema.Attribute.String;
  };
}

export interface ElementsSubLinks extends Struct.ComponentSchema {
  collectionName: 'components_elements_sub_links';
  info: {
    description: '';
    displayName: 'SubLinks';
  };
  attributes: {
    Href: Schema.Attribute.String;
    isExternal: Schema.Attribute.Boolean;
    Title: Schema.Attribute.String;
  };
}

export interface ElementsTitleList extends Struct.ComponentSchema {
  collectionName: 'components_elements_title_lists';
  info: {
    displayName: 'Title_List';
  };
  attributes: {
    Options: Schema.Attribute.Component<'elements.list', true>;
    Title: Schema.Attribute.String;
  };
}

export interface FaqFaqQuestions extends Struct.ComponentSchema {
  collectionName: 'components_faq_faq_questions';
  info: {
    displayName: 'Faq_Questions';
  };
  attributes: {
    Answer: Schema.Attribute.Component<'components.description-list', false>;
    Question: Schema.Attribute.String;
  };
}

export interface FaqFaqSections extends Struct.ComponentSchema {
  collectionName: 'components_faq_faq_sections';
  info: {
    displayName: 'Faq_Sections';
  };
  attributes: {
    Faq_Questions: Schema.Attribute.Component<'faq.faq-questions', true>;
    Title: Schema.Attribute.String;
  };
}

export interface HistoryLineageAboutCard extends Struct.ComponentSchema {
  collectionName: 'components_history_lineage_about_cards';
  info: {
    description: '';
    displayName: 'About_Card';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Image_Box: Schema.Attribute.Component<'components.image-box', false>;
    Title: Schema.Attribute.String;
  };
}

export interface HistoryLineageFoundingTeam extends Struct.ComponentSchema {
  collectionName: 'components_history_lineage_founding_teams';
  info: {
    description: '';
    displayName: 'Founding_Team';
  };
  attributes: {
    Description: Schema.Attribute.Component<'elements.list', true>;
    Founder_Image: Schema.Attribute.Component<'components.image-title', true>;
  };
}

export interface HistoryLineageSection1 extends Struct.ComponentSchema {
  collectionName: 'components_history_lineage_section_1s';
  info: {
    displayName: 'Section_1';
  };
  attributes: {
    About_Card: Schema.Attribute.Component<'history-lineage.about-card', true>;
  };
}

export interface HistoryLineageSection2 extends Struct.ComponentSchema {
  collectionName: 'components_history_lineage_section_2s';
  info: {
    description: '';
    displayName: 'Section_2';
  };
  attributes: {
    Family_Tree_Image: Schema.Attribute.Media<'images'>;
    Founding_Team: Schema.Attribute.Component<
      'history-lineage.founding-team',
      true
    >;
    History_Card: Schema.Attribute.Component<
      'history-lineage.about-card',
      true
    >;
  };
}

export interface HistoryLineageSection3 extends Struct.ComponentSchema {
  collectionName: 'components_history_lineage_section_3s';
  info: {
    description: '';
    displayName: 'Section_3';
  };
  attributes: {
    Founder_Team: Schema.Attribute.Component<
      'history-lineage.founding-team',
      true
    >;
    Title: Schema.Attribute.String;
  };
}

export interface HomePageAdvertisementSection extends Struct.ComponentSchema {
  collectionName: 'components_home_page_advertisement_sections';
  info: {
    description: '';
    displayName: 'Advertisement_Section';
  };
  attributes: {
    Button: Schema.Attribute.Component<'elements.button', false>;
    Description: Schema.Attribute.Text;
    Media: Schema.Attribute.Media<'images'>;
    Title: Schema.Attribute.String;
  };
}

export interface HomePageHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_home_page_hero_sections';
  info: {
    description: '';
    displayName: 'Hero_Section';
  };
  attributes: {
    Media: Schema.Attribute.Media<'videos', true>;
  };
}

export interface HomePageInstagramCards extends Struct.ComponentSchema {
  collectionName: 'components_home_page_instagram_cards';
  info: {
    displayName: 'Instagram_Cards';
  };
  attributes: {
    Href: Schema.Attribute.String;
    Thumbnail: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface HomePageInstagramSection extends Struct.ComponentSchema {
  collectionName: 'components_home_page_instagram_sections';
  info: {
    displayName: 'Instagram_Section';
  };
  attributes: {
    Instagram_Cards: Schema.Attribute.Component<
      'home-page.instagram-cards',
      true
    >;
  };
}

export interface HomePageReadyToShip extends Struct.ComponentSchema {
  collectionName: 'components_home_page_ready_to_ships';
  info: {
    description: '';
    displayName: 'Ready_To_Ship';
  };
  attributes: {
    Button: Schema.Attribute.Component<'elements.button', false>;
    Media: Schema.Attribute.Media<'images', true>;
    Title: Schema.Attribute.String;
  };
}

export interface HomePageShopByCategory extends Struct.ComponentSchema {
  collectionName: 'components_home_page_shop_by_categories';
  info: {
    displayName: 'Shop_By_Category';
  };
  attributes: {
    Title: Schema.Attribute.String;
  };
}

export interface HomePageShopByCollection extends Struct.ComponentSchema {
  collectionName: 'components_home_page_shop_by_collections';
  info: {
    displayName: 'Shop_By_Collection';
  };
  attributes: {
    Title: Schema.Attribute.String;
  };
}

export interface HomePageShopSection extends Struct.ComponentSchema {
  collectionName: 'components_home_page_shop_sections';
  info: {
    description: '';
    displayName: 'Shop_Section';
  };
  attributes: {
    Products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    Title: Schema.Attribute.String;
  };
}

export interface ItemsConnectUsItem extends Struct.ComponentSchema {
  collectionName: 'components_items_connect_us_items';
  info: {
    description: '';
    displayName: 'Connect_Us_Item';
  };
  attributes: {
    Address: Schema.Attribute.Component<'elements.list', true>;
    Title: Schema.Attribute.String;
  };
}

export interface LayoutConnectUs extends Struct.ComponentSchema {
  collectionName: 'components_layout_connect_uses';
  info: {
    displayName: 'Connect_Us';
  };
  attributes: {
    Connect_Us_Items: Schema.Attribute.Component<'items.connect-us-item', true>;
    Title: Schema.Attribute.String;
  };
}

export interface LayoutTopNav extends Struct.ComponentSchema {
  collectionName: 'components_layout_top_navs';
  info: {
    description: '';
    displayName: 'Top Nav';
  };
  attributes: {
    Categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    >;
    Collections: Schema.Attribute.Relation<
      'oneToMany',
      'api::collection.collection'
    >;
    Curation_And_Revivals: Schema.Attribute.Relation<
      'oneToMany',
      'api::curation-and-revival.curation-and-revival'
    >;
    Fabric_Types: Schema.Attribute.Relation<
      'oneToMany',
      'api::fabric-type.fabric-type'
    >;
    Link: Schema.Attribute.Component<'elements.link', true>;
    Motif_And_Designs: Schema.Attribute.Relation<
      'oneToMany',
      'api::motif-and-design.motif-and-design'
    >;
    Weaving_Techniques: Schema.Attribute.Relation<
      'oneToMany',
      'api::weaving-technique.weaving-technique'
    >;
  };
}

export interface ManagementSection1 extends Struct.ComponentSchema {
  collectionName: 'components_management_section_1s';
  info: {
    displayName: 'Section_1';
  };
  attributes: {
    Member_Details: Schema.Attribute.Component<
      'history-lineage.about-card',
      true
    >;
  };
}

export interface ManagementSection2 extends Struct.ComponentSchema {
  collectionName: 'components_management_section_2s';
  info: {
    displayName: 'Section_2';
  };
  attributes: {
    Profile: Schema.Attribute.Component<'components.image-title', true>;
  };
}

export interface PrivacyPolicySection extends Struct.ComponentSchema {
  collectionName: 'components_privacy_policy_sections';
  info: {
    displayName: 'Section';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Title: Schema.Attribute.String;
  };
}

export interface ProductMeasurement extends Struct.ComponentSchema {
  collectionName: 'components_product_measurements';
  info: {
    displayName: 'Measurement';
  };
  attributes: {
    cm: Schema.Attribute.String;
    inch: Schema.Attribute.String;
  };
}

export interface ProductProductDetails extends Struct.ComponentSchema {
  collectionName: 'components_product_product_details';
  info: {
    description: '';
    displayName: 'Product_Details';
  };
  attributes: {
    Descriptions: Schema.Attribute.Component<
      'components.description-list',
      false
    >;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductProductGuide extends Struct.ComponentSchema {
  collectionName: 'components_product_product_guides';
  info: {
    description: '';
    displayName: 'Product_Guide';
  };
  attributes: {};
}

export interface ProductProductSizes extends Struct.ComponentSchema {
  collectionName: 'components_product_product_sizes';
  info: {
    displayName: 'Product_Sizes';
  };
  attributes: {
    Measurement: Schema.Attribute.Component<'product.measurement', true>;
    Title: Schema.Attribute.String;
  };
}

export interface UserProductPaymentDetails extends Struct.ComponentSchema {
  collectionName: 'components_user_product_payment_details';
  info: {
    description: '';
    displayName: 'Payment_Details';
  };
  attributes: {
    Amount: Schema.Attribute.Decimal;
    Order_Uid: Schema.Attribute.String;
    Payment_Status: Schema.Attribute.Enumeration<
      ['INITIATED', 'PENDING', 'COMPLETED', 'FAILED']
    >;
    Paypal_Response: Schema.Attribute.JSON;
  };
}

export interface UserProductPrizeSection extends Struct.ComponentSchema {
  collectionName: 'components_user_product_prize_sections';
  info: {
    description: '';
    displayName: 'Price_Section';
  };
  attributes: {
    Discount_Available: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    Discounted_Price: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    Option: Schema.Attribute.String;
    Price: Schema.Attribute.Integer;
  };
}

export interface UserProductProduct extends Struct.ComponentSchema {
  collectionName: 'components_user_product_products';
  info: {
    description: '';
    displayName: 'product';
  };
  attributes: {
    Color: Schema.Attribute.String;
    Discount_Available: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    Discounted_Price: Schema.Attribute.Integer & Schema.Attribute.Required;
    Option: Schema.Attribute.String;
    Price: Schema.Attribute.Integer & Schema.Attribute.Required;
    Product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    Quantity: Schema.Attribute.Integer & Schema.Attribute.Required;
    Size: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'banarasi-weave-design-pattern.section-1': BanarasiWeaveDesignPatternSection1;
      'banarasi-weave-technique.section-1': BanarasiWeaveTechniqueSection1;
      'banarasi-weaves.fabric-overview': BanarasiWeavesFabricOverview;
      'blogs.blog-section': BlogsBlogSection;
      'components.book-an-appointment': ComponentsBookAnAppointment;
      'components.description-list': ComponentsDescriptionList;
      'components.descriptions': ComponentsDescriptions;
      'components.dropdown-option': ComponentsDropdownOption;
      'components.image-box': ComponentsImageBox;
      'components.image-title': ComponentsImageTitle;
      'components.input-field': ComponentsInputField;
      'components.social-network': ComponentsSocialNetwork;
      'components.title-description': ComponentsTitleDescription;
      'contact-page.contact-details': ContactPageContactDetails;
      'contact-page.contact-form': ContactPageContactForm;
      'contact-page.section-1': ContactPageSection1;
      'contact-page.section-2': ContactPageSection2;
      'elements.button': ElementsButton;
      'elements.link': ElementsLink;
      'elements.list': ElementsList;
      'elements.list-with-title': ElementsListWithTitle;
      'elements.logo-link': ElementsLogoLink;
      'elements.search-bar': ElementsSearchBar;
      'elements.sub-links': ElementsSubLinks;
      'elements.title-list': ElementsTitleList;
      'faq.faq-questions': FaqFaqQuestions;
      'faq.faq-sections': FaqFaqSections;
      'history-lineage.about-card': HistoryLineageAboutCard;
      'history-lineage.founding-team': HistoryLineageFoundingTeam;
      'history-lineage.section-1': HistoryLineageSection1;
      'history-lineage.section-2': HistoryLineageSection2;
      'history-lineage.section-3': HistoryLineageSection3;
      'home-page.advertisement-section': HomePageAdvertisementSection;
      'home-page.hero-section': HomePageHeroSection;
      'home-page.instagram-cards': HomePageInstagramCards;
      'home-page.instagram-section': HomePageInstagramSection;
      'home-page.ready-to-ship': HomePageReadyToShip;
      'home-page.shop-by-category': HomePageShopByCategory;
      'home-page.shop-by-collection': HomePageShopByCollection;
      'home-page.shop-section': HomePageShopSection;
      'items.connect-us-item': ItemsConnectUsItem;
      'layout.connect-us': LayoutConnectUs;
      'layout.top-nav': LayoutTopNav;
      'management.section-1': ManagementSection1;
      'management.section-2': ManagementSection2;
      'privacy-policy.section': PrivacyPolicySection;
      'product.measurement': ProductMeasurement;
      'product.product-details': ProductProductDetails;
      'product.product-guide': ProductProductGuide;
      'product.product-sizes': ProductProductSizes;
      'user-product.payment-details': UserProductPaymentDetails;
      'user-product.prize-section': UserProductPrizeSection;
      'user-product.product': UserProductProduct;
    }
  }
}
