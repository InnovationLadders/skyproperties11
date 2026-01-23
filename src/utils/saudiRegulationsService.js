import { collection, doc, getDoc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

const REGULATIONS_COLLECTION = 'saudiRegulations';

export const getRegulationsContent = async (language = 'en') => {
  try {
    const docRef = doc(db, REGULATIONS_COLLECTION, language);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() }
      };
    } else {
      await createDefaultContent(language);
      const newDocSnap = await getDoc(docRef);
      return {
        success: true,
        data: { id: newDocSnap.id, ...newDocSnap.data() }
      };
    }
  } catch (error) {
    console.error('Error fetching regulations content:', error);
    return { success: false, error: error.message };
  }
};

export const updateRegulationsContent = async (language, content, userId) => {
  try {
    const docRef = doc(db, REGULATIONS_COLLECTION, language);
    const updateData = {
      ...content,
      language,
      lastUpdatedBy: userId,
      lastUpdatedAt: serverTimestamp(),
    };

    await setDoc(docRef, updateData, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error updating regulations content:', error);
    return { success: false, error: error.message };
  }
};

export const createDefaultContent = async (language = 'en') => {
  const defaultContent = language === 'ar' ? getDefaultArabicContent() : getDefaultEnglishContent();

  try {
    const docRef = doc(db, REGULATIONS_COLLECTION, language);
    await setDoc(docRef, {
      ...defaultContent,
      language,
      createdAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp(),
      isPublished: true,
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating default content:', error);
    return { success: false, error: error.message };
  }
};

const getDefaultEnglishContent = () => ({
  title: 'Saudi Property Regulations',
  subtitle: 'Regulations for Foreign Property Ownership in Saudi Arabia',
  mainContent: `<p>Saudi Arabia has opened its doors to foreign property ownership with specific regulations and guidelines. This page provides essential information about property ownership rights for foreigners in the Kingdom.</p>`,
  sections: [
    {
      question: 'Can foreigners own property in Saudi Arabia?',
      answer: 'Yes, foreigners can own property in Saudi Arabia. The Saudi government has allowed foreign nationals to own real estate for residential purposes, subject to certain conditions and approvals from the Ministry of Interior and relevant authorities.'
    },
    {
      question: 'What are the restrictions for foreign property ownership?',
      answer: 'Foreign ownership is limited to one residential property per person. The property must be for personal use and not for commercial purposes. Foreigners are not allowed to own property in Mecca and Medina. The property value must meet minimum investment requirements set by the authorities.'
    },
    {
      question: 'Which areas allow foreign ownership?',
      answer: 'Foreigners can own property in most major cities including Riyadh, Jeddah, Dammam, Khobar, and other urban areas. However, ownership in the holy cities of Mecca and Medina is restricted to Saudi nationals only.'
    },
    {
      question: 'What documents are required for foreigners to buy property?',
      answer: 'Required documents include: Valid passport and residency permit (Iqama), No Objection Certificate (NOC) from sponsor or employer, Property deed (Sakk), Ministry of Justice approval, Proof of funds and financial capability, Tax clearance certificate, and Completed property registration forms.'
    },
    {
      question: 'Are there any special taxes for foreign property owners?',
      answer: 'Foreign property owners are subject to the same property taxes as Saudi nationals. This includes the annual property tax (White Land Tax if applicable), municipality fees, and VAT on property transactions (currently 5% in Saudi Arabia). Additional taxes may apply based on property type and usage.'
    },
    {
      question: 'Can foreigners get mortgages in Saudi Arabia?',
      answer: 'Yes, several Saudi banks offer mortgage products to foreign residents who meet specific criteria. Requirements typically include: Minimum residency period in Saudi Arabia, Stable employment with a reputable employer, Minimum salary requirements, Good credit history, and Down payment (usually 15-30% of property value).'
    },
    {
      question: 'What is the process for property registration?',
      answer: 'The property registration process involves: 1) Property search and selection, 2) Obtaining initial approval from relevant authorities, 3) Property valuation and inspection, 4) Signing the preliminary purchase agreement, 5) Obtaining final approval from Ministry of Justice, 6) Completing financial transactions, 7) Registration with the Real Estate General Authority, and 8) Receiving the official property deed (Sakk).'
    },
    {
      question: 'Are there any visa or residency benefits for property owners?',
      answer: 'Property ownership does not automatically grant residency rights. However, foreign property owners may be eligible for certain visa facilities and may apply for long-term residency permits under specific investment programs. The Saudi government has introduced premium residency programs that may benefit property investors.'
    },
    {
      question: 'What are the legal requirements for rental properties?',
      answer: 'If you plan to rent your property, you must: Register the property with the Ejar platform, Sign contracts through the Ejar system, Comply with rental regulations and tenant rights, Pay applicable taxes on rental income, Maintain the property according to municipality standards, and Obtain necessary permits for short-term rentals if applicable.'
    },
    {
      question: 'How are property disputes resolved?',
      answer: 'Property disputes are handled through: The Ministry of Justice court system, Alternative dispute resolution mechanisms, Mediation services provided by the Ministry of Justice, and The Real Estate General Authority for regulatory matters. Legal representation is advisable for complex disputes, and all proceedings are conducted in Arabic.'
    }
  ]
});

const getDefaultArabicContent = () => ({
  title: 'أنظمة العقارات السعودية',
  subtitle: 'أنظمة تملك الأجانب للعقارات في المملكة العربية السعودية',
  mainContent: `<p>فتحت المملكة العربية السعودية أبوابها لتملك الأجانب للعقارات مع أنظمة وإرشادات محددة. توفر هذه الصفحة معلومات أساسية حول حقوق تملك العقارات للأجانب في المملكة.</p>`,
  sections: [
    {
      question: 'هل يمكن للأجانب تملك العقارات في السعودية؟',
      answer: 'نعم، يمكن للأجانب تملك العقارات في المملكة العربية السعودية. فقد سمحت الحكومة السعودية للمواطنين الأجانب بتملك العقارات لأغراض السكن، وذلك وفق شروط معينة وموافقات من وزارة الداخلية والجهات المختصة.'
    },
    {
      question: 'ما هي القيود على تملك الأجانب للعقارات؟',
      answer: 'يقتصر تملك الأجانب على عقار سكني واحد لكل شخص. يجب أن يكون العقار للاستخدام الشخصي وليس للأغراض التجارية. لا يُسمح للأجانب بتملك العقارات في مكة المكرمة والمدينة المنورة. يجب أن تستوفي قيمة العقار الحد الأدنى من متطلبات الاستثمار التي تحددها السلطات.'
    },
    {
      question: 'ما هي المناطق التي تسمح بتملك الأجانب؟',
      answer: 'يمكن للأجانب تملك العقارات في معظم المدن الرئيسية بما في ذلك الرياض وجدة والدمام والخبر والمناطق الحضرية الأخرى. ومع ذلك، فإن التملك في المدينتين المقدستين مكة المكرمة والمدينة المنورة مقتصر على المواطنين السعوديين فقط.'
    },
    {
      question: 'ما هي المستندات المطلوبة لشراء عقار للأجانب؟',
      answer: 'المستندات المطلوبة تشمل: جواز سفر ساري وإقامة سارية المفعول، شهادة عدم ممانعة من الكفيل أو صاحب العمل، صك الملكية، موافقة وزارة العدل، إثبات القدرة المالية، شهادة الإعفاء الضريبي، واستكمال نماذج تسجيل الملكية.'
    },
    {
      question: 'هل توجد ضرائب خاصة لملاك العقارات الأجانب؟',
      answer: 'يخضع ملاك العقارات الأجانب لنفس الضرائب العقارية المفروضة على المواطنين السعوديين. وتشمل هذه الضريبة العقارية السنوية (ضريبة الأراضي البيضاء إن وجدت)، ورسوم البلدية، وضريبة القيمة المضافة على المعاملات العقارية (حالياً 5% في المملكة). قد تنطبق ضرائب إضافية بناءً على نوع العقار واستخدامه.'
    },
    {
      question: 'هل يمكن للأجانب الحصول على قروض عقارية في السعودية؟',
      answer: 'نعم، تقدم عدة بنوك سعودية منتجات التمويل العقاري للمقيمين الأجانب الذين يستوفون معايير محددة. تشمل المتطلبات عادةً: حد أدنى لفترة الإقامة في المملكة، وظيفة مستقرة لدى جهة موثوقة، حد أدنى من متطلبات الراتب، سجل ائتماني جيد، ودفعة مقدمة (عادة 15-30% من قيمة العقار).'
    },
    {
      question: 'ما هي عملية تسجيل العقار؟',
      answer: 'تتضمن عملية تسجيل العقار: 1) البحث عن العقار واختياره، 2) الحصول على الموافقة الأولية من الجهات المختصة، 3) تقييم العقار وفحصه، 4) توقيع عقد الشراء الأولي، 5) الحصول على الموافقة النهائية من وزارة العدل، 6) إتمام المعاملات المالية، 7) التسجيل لدى الهيئة العامة للعقار، و8) استلام صك الملكية الرسمي.'
    },
    {
      question: 'هل توجد مزايا في التأشيرات أو الإقامة لملاك العقارات؟',
      answer: 'لا يمنح تملك العقار تلقائياً حقوق الإقامة. ومع ذلك، قد يكون ملاك العقارات الأجانب مؤهلين للحصول على تسهيلات معينة في التأشيرات وقد يتقدمون بطلب للحصول على تصاريح إقامة طويلة الأجل بموجب برامج استثمارية محددة. قدمت الحكومة السعودية برامج إقامة مميزة قد تفيد مستثمري العقارات.'
    },
    {
      question: 'ما هي المتطلبات القانونية للعقارات المؤجرة؟',
      answer: 'إذا كنت تخطط لتأجير عقارك، يجب عليك: تسجيل العقار في منصة إيجار، توقيع العقود من خلال نظام إيجار، الامتثال للوائح الإيجار وحقوق المستأجرين، دفع الضرائب المطبقة على دخل الإيجار، صيانة العقار وفقاً لمعايير البلدية، والحصول على التصاريح اللازمة للإيجار قصير الأجل إن وجدت.'
    },
    {
      question: 'كيف يتم حل النزاعات العقارية؟',
      answer: 'يتم التعامل مع النزاعات العقارية من خلال: نظام المحاكم في وزارة العدل، آليات الحل البديل للنزاعات، خدمات الوساطة التي تقدمها وزارة العدل، والهيئة العامة للعقار للمسائل التنظيمية. يُنصح بالتمثيل القانوني للنزاعات المعقدة، وتُجرى جميع الإجراءات باللغة العربية.'
    }
  ]
});

export const publishContent = async (language, userId) => {
  try {
    const docRef = doc(db, REGULATIONS_COLLECTION, language);
    await setDoc(docRef, {
      isPublished: true,
      lastPublishedBy: userId,
      lastPublishedAt: serverTimestamp(),
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error publishing content:', error);
    return { success: false, error: error.message };
  }
};
