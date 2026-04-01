import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

const FOREIGN_SERVICES_COLLECTION = 'foreignServices';

export const foreignServicesService = {
  async getContent(language = 'en') {
    try {
      const docRef = doc(db, FOREIGN_SERVICES_COLLECTION, language);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.is_published) {
          return { id: docSnap.id, ...data };
        }
      }

      await createDefaultContent(language);
      const newDocSnap = await getDoc(docRef);
      if (newDocSnap.exists()) {
        return { id: newDocSnap.id, ...newDocSnap.data() };
      }

      return null;
    } catch (error) {
      console.error('Error fetching foreign services content:', error);
      throw error;
    }
  },

  async getContentForAdmin(language = 'en') {
    try {
      const docRef = doc(db, FOREIGN_SERVICES_COLLECTION, language);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        await createDefaultContent(language);
        const newDocSnap = await getDoc(docRef);
        return { id: newDocSnap.id, ...newDocSnap.data() };
      }
    } catch (error) {
      console.error('Error fetching foreign services content for admin:', error);
      throw error;
    }
  },

  async updateContent(language, contentData, userEmail) {
    try {
      const docRef = doc(db, FOREIGN_SERVICES_COLLECTION, language);
      const updateData = {
        ...contentData,
        language,
        updated_at: serverTimestamp(),
        last_updated_by: userEmail,
      };

      await setDoc(docRef, updateData, { merge: true });

      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating foreign services content:', error);
      throw error;
    }
  },

  async publishContent(language, userEmail) {
    try {
      const docRef = doc(db, FOREIGN_SERVICES_COLLECTION, language);
      await setDoc(docRef, {
        is_published: true,
        updated_at: serverTimestamp(),
        last_updated_by: userEmail,
      }, { merge: true });

      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error publishing foreign services content:', error);
      throw error;
    }
  },
};

const createDefaultContent = async (language = 'en') => {
  const defaultContent = language === 'ar' ? getDefaultArabicContent() : getDefaultEnglishContent();

  try {
    const docRef = doc(db, FOREIGN_SERVICES_COLLECTION, language);
    await setDoc(docRef, {
      ...defaultContent,
      language,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      is_published: true,
    });
  } catch (error) {
    console.error('Error creating default content:', error);
    throw error;
  }
};

const getDefaultEnglishContent = () => ({
  page_title: 'Foreign Services',
  page_subtitle: 'Information and services for international residents and property owners',
  section_1_title: 'Property Ownership for Foreigners',
  section_1_content: `Foreign nationals can own property in Saudi Arabia for residential purposes, subject to certain conditions and approvals from the Ministry of Interior and relevant authorities.

Key requirements include:
- Valid residency permit (Iqama)
- No Objection Certificate (NOC) from sponsor
- Ministry of Justice approval
- Compliance with local regulations`,
  section_2_title: 'Legal Requirements',
  section_2_content: `All foreign property owners must comply with Saudi Arabian property laws and regulations.

Required documents:
- Valid passport and Iqama
- Property deed (Sakk)
- Tax clearance certificate
- Completed registration forms`,
  section_3_title: 'Services Available',
  section_3_content: `We offer comprehensive support services for international residents:

- Property management assistance
- Legal documentation support
- Translation services
- Liaison with government authorities
- Rental contract preparation`,
  section_4_title: 'Contact Information',
  section_4_content: `For more information about foreign services, please contact our international services department.

We are available to assist you with all property-related matters and ensure compliance with Saudi regulations.`,
});

const getDefaultArabicContent = () => ({
  page_title: 'خدمات الأجانب',
  page_subtitle: 'معلومات وخدمات للمقيمين الدوليين وملاك العقارات',
  section_1_title: 'تملك العقارات للأجانب',
  section_1_content: `يمكن للمواطنين الأجانب تملك العقارات في المملكة العربية السعودية لأغراض السكن، وذلك وفق شروط معينة وموافقات من وزارة الداخلية والجهات المختصة.

المتطلبات الرئيسية تشمل:
- إقامة سارية المفعول
- شهادة عدم ممانعة من الكفيل
- موافقة وزارة العدل
- الامتثال للأنظمة المحلية`,
  section_2_title: 'المتطلبات القانونية',
  section_2_content: `يجب على جميع ملاك العقارات الأجانب الامتثال لقوانين وأنظمة العقارات في المملكة العربية السعودية.

المستندات المطلوبة:
- جواز سفر وإقامة سارية
- صك الملكية
- شهادة الإعفاء الضريبي
- استكمال نماذج التسجيل`,
  section_3_title: 'الخدمات المتاحة',
  section_3_content: `نقدم خدمات دعم شاملة للمقيمين الدوليين:

- المساعدة في إدارة العقارات
- دعم التوثيق القانوني
- خدمات الترجمة
- الاتصال مع الجهات الحكومية
- إعداد عقود الإيجار`,
  section_4_title: 'معلومات الاتصال',
  section_4_content: `للمزيد من المعلومات حول خدمات الأجانب، يرجى الاتصال بقسم الخدمات الدولية لدينا.

نحن متاحون لمساعدتك في جميع الأمور المتعلقة بالعقارات وضمان الامتثال للأنظمة السعودية.`,
});
