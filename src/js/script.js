 // فتح نموذج التقديم
const applyButtons = document.querySelectorAll('.apply-btn');
const applicationForm = document.getElementById('applicationForm');
const closeForm = document.querySelector('.close-form');
const selectedJobInput = document.getElementById('selectedJob');
const cvInput = document.getElementById('cv');

applyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const jobTitle = button.getAttribute('data-job');
        selectedJobInput.value = jobTitle;
        document.querySelector('.form-title').textContent = `تقديم على وظيفة ${jobTitle}`;
        applicationForm.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
});

// إغلاق نموذج التقديم
closeForm.addEventListener('click', () => {
    applicationForm.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// إغلاق النموذج عند النقر خارج المحتوى
window.addEventListener('click', (e) => {
    if (e.target === applicationForm) {
        applicationForm.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// إرسال النموذج
const jobApplicationForm = document.getElementById('jobApplicationForm');

jobApplicationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // جمع بيانات النموذج
        const formData = new FormData(jobApplicationForm);
        const applicationData = {};
        let cvFile = null;
        
        for (let [key, value] of formData.entries()) {
            if (key === 'cv') {
                cvFile = value; // حفظ ملف السيرة الذاتية
            } else {
                applicationData[key] = value;
            }
        }
        
        // إنشاء رقم طلب عشوائي
        const applicationId = 'KOSTER-' + Math.floor(100000 + Math.random() * 900000);
        applicationData.applicationId = applicationId;
        
        // إرسال البيانات إلى Telegram
        await sendToTelegram(applicationData, cvFile);
        
        // عرض رسالة النجاح
        showSuccessPopup(applicationId);
        
        // إغلاق النموذج
        applicationForm.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // إعادة تعيين النموذج
        jobApplicationForm.reset();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
    }
});

// دالة إرسال البيانات إلى Telegram مع دعم الملفات
async function sendToTelegram(data, cvFile) {
    // استبدل هذه القيم بمعلومات بوت Telegram الخاص بك
    const botToken = '1409439756:AAGhh-OFfUS4H5Crk4m4Nh3aVFzfM0_q3zQ';
    const chatId = '-1002452852380';
    
    // إنشاء نص الرسالة
    let message = `📌 *طلب توظيف جديد*\n\n`;
    message += `📝 *رقم الطلب:* ${data.applicationId}\n`;
    message += `👤 *الاسم:* ${data.fullName}\n`;
    message += `📧 *البريد الإلكتروني:* ${data.email}\n`;
    message += `📱 *رقم الهاتف:* ${data.phone}\n`;
    message += `🏙️ *المدينة:* ${data.city}\n`;
    message += `💼 *الوظيفة المطلوبة:* ${data.selectedJob}\n`;
    message += `📅 *سنوات الخبرة:* ${data.experience}\n`;
    message += `🎓 *المؤهل العلمي:* ${data.education}\n`;
    message += `✉️ *رسالة التقديم:* ${data.message || 'لا توجد'}\n\n`;
    message += `🕒 *تاريخ التقديم:* ${new Date().toLocaleString()}`;

    // 1. إرسال الرسالة النصية أولاً
    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    });
    
    const textResult = await textResponse.json();
    console.log('تم إرسال الرسالة النصية:', textResult);
    
    // 2. إذا كان هناك ملف سيرة ذاتية، نقوم بإرساله
    if (cvFile) {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('document', cvFile);
        formData.append('caption', `السيرة الذاتية لـ ${data.fullName} (${data.applicationId})`);
        
        const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
            method: 'POST',
            body: formData
        });
        
        const fileResult = await fileResponse.json();
        console.log('تم إرسال ملف السيرة الذاتية:', fileResult);
    }
}

// دالة عرض رسالة النجاح
function showSuccessPopup(applicationId) {
    const popup = document.getElementById('successPopup');
    const displayId = document.getElementById('displayApplicationId');
    
    displayId.textContent = applicationId;
    popup.style.display = 'flex';
    
    // إغلاق النافذة المنبثقة
    document.querySelector('.close-popup').onclick = () => {
        popup.style.display = 'none';
    };
    
    // إغلاق عند النقر خارج المحتوى
    popup.onclick = (e) => {
        if (e.target === popup) {
            popup.style.display = 'none';
        }
    };
}