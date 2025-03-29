// تعريف Supabase
const SUPABASE_URL = "https://npwmyyolczavvalggskr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wd215eW9sY3phdnZhbGdnc2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMTUwMTcsImV4cCI6MjA1ODc5MTAxN30.2VGsw5WdNu9LiNdb5dG2J62ipRQveSwj55IX-C2xSKU";

let supabase;
<!-- ضع هذا السكربت داخل <head> أو فوق ملف main.js مباشرة -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/dist/supabase.min.js"></script>


// تأكد من تحميل مكتبة supabase-js بنجاح
if (typeof SupabaseClient === 'undefined') {
  console.error("❌ مكتبة supabase-js لم يتم تحميلها بشكل صحيح. تأكد من الرابط المستخدم.");
} else {
  console.log("✅ مكتبة supabase-js تم تحميلها بنجاح.");
  supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// الآن أصبح عندنا متغير supabase جاهز للاستخدام


let images = [];
let index = 0;

// رفع صورة جديدة وتسجيلها في قاعدة البيانات
async function uploadImage() {
  const fileInput = document.getElementById('upload');
  const file = fileInput.files[0];
  if (!file) return alert("يرجى اختيار صورة");

  const { data, error } = await supabase.storage.from('screens').upload(`images/${file.name}`, file);

  if (error) {
    console.error('خطأ في رفع الصورة:', error.message);
    return;
  }

  const { publicURL } = supabase.storage.from('screens').getPublicUrl(`images/${file.name}`);
  console.log('رابط الصورة:', publicURL);

  await supabase.from('logs').insert([
    { action: 'رفع صورة', image_url: publicURL }
  ]);

  alert('✅ تم رفع الصورة بنجاح!');
}

// جلب السجلات من قاعدة البيانات
async function fetchLogs() {
  const { data, error } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });

  if (error) {
    console.error('خطأ في جلب السجلات:', error.message);
    return;
  }

  const logsDiv = document.getElementById('logs');
  logsDiv.innerHTML = JSON.stringify(data, null, 2);
}

// جلب الصور من قاعدة البيانات لعرضها في viewer.html
async function fetchImages() {
  const { data, error } = await supabase.from('logs').select('image_url');

  if (error) {
    console.error('خطأ في جلب الصور:', error.message);
    return;
  }

  images = data.map(item => item.image_url);
  showImage();
}

function showImage() {
  if (images.length === 0) return;

  const imgElement = document.getElementById('currentImage');
  imgElement.src = images[index];

  index = (index + 1) % images.length;

  setTimeout(showImage, 5000); // تغيير الصورة كل 5 ثواني
}

// إذا كانت الصفحة الحالية هي viewer.html، ابدأ العرض
if (document.getElementById('slideshow')) {
  fetchImages();
}
