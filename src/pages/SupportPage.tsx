import React, { useState } from 'react';
import { 
    PhoneIcon, 
    EnvelopeIcon, 
    ChatBubbleLeftRightIcon,
    QuestionMarkCircleIcon,
    WrenchScrewdriverIcon,
    ShieldCheckIcon,
    ClockIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

const SupportPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        message: ''
    });

    const supportCategories = [
        {
            id: 'technical',
            name: 'Hỗ trợ kỹ thuật',
            icon: WrenchScrewdriverIcon,
            description: 'Sự cố phần cứng, phần mềm và thiết lập'
        },
        {
            id: 'warranty',
            name: 'Bảo hành',
            icon: ShieldCheckIcon,
            description: 'Thông tin bảo hành và yêu cầu sửa chữa'
        },
        {
            id: 'order',
            name: 'Đơn hàng',
            icon: ClockIcon,
            description: 'Trạng thái đơn hàng, giao hàng và thanh toán'
        },
        {
            id: 'general',
            name: 'Câu hỏi chung',
            icon: QuestionMarkCircleIcon,
            description: 'Thông tin sản phẩm và dịch vụ'
        }
    ];

    const faqData = [
        {
            category: 'Đơn hàng',
            questions: [
                {
                    q: 'Làm thế nào để theo dõi đơn hàng của tôi?',
                    a: 'Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và vào mục "Đơn hàng của tôi" hoặc sử dụng mã đơn hàng được gửi qua email.'
                },
                {
                    q: 'Tôi có thể hủy đơn hàng không?',
                    a: 'Bạn có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt hàng. Sau thời gian này, vui lòng liên hệ với chúng tôi để được hỗ trợ.'
                },
                {
                    q: 'Thời gian giao hàng là bao lâu?',
                    a: 'Thời gian giao hàng tiêu chuẩn là 2-3 ngày làm việc trong nội thành và 3-5 ngày cho các tỉnh thành khác.'
                }
            ]
        },
        {
            category: 'Bảo hành',
            questions: [
                {
                    q: 'Thời gian bảo hành của sản phẩm Apple là bao lâu?',
                    a: 'Tất cả sản phẩm Apple đều có bảo hành chính hãng 12 tháng từ ngày mua. Một số sản phẩm có thể có bảo hành mở rộng.'
                },
                {
                    q: 'Tôi cần mang gì khi đến bảo hành?',
                    a: 'Bạn cần mang theo sản phẩm, hóa đơn mua hàng và giấy tờ tùy thân. Đảm bảo sao lưu dữ liệu trước khi mang đi bảo hành.'
                }
            ]
        }
    ];

    const contactMethods = [
        {
            icon: PhoneIcon,
            title: 'Hotline',
            value: '1900-1234',
            description: 'Hỗ trợ 24/7',
            action: 'tel:1900-1234'
        },
        {
            icon: EnvelopeIcon,
            title: 'Email',
            value: 'support@appleshop.vn',
            description: 'Phản hồi trong 24h',
            action: 'mailto:support@appleshop.vn'
        },
        {
            icon: ChatBubbleLeftRightIcon,
            title: 'Live Chat',
            value: 'Chat trực tuyến',
            description: 'Thứ 2 - Chủ nhật: 8:00 - 22:00',
            action: '#'
        },
        {
            icon: MapPinIcon,
            title: 'Cửa hàng',
            value: '123 Nguyễn Huệ, Q1, TP.HCM',
            description: 'Thứ 2 - Chủ nhật: 9:00 - 21:00',
            action: '#'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log('Contact form submitted:', contactForm);
        alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
        setContactForm({
            name: '',
            email: '',
            phone: '',
            category: '',
            subject: '',
            message: ''
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Trung tâm hỗ trợ
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi thắc mắc về sản phẩm và dịch vụ
                </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {contactMethods.map((method, index) => (
                    <a
                        key={index}
                        href={method.action}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
                    >
                        <method.icon className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                        <p className="text-blue-600 font-medium mb-1">{method.value}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                    </a>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi yêu cầu hỗ trợ</h2>
                    
                    {/* Support Categories */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {supportCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setSelectedCategory(category.id);
                                    setContactForm(prev => ({ ...prev, category: category.name }));
                                }}
                                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                                    selectedCategory === category.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <category.icon className="w-6 h-6 text-blue-600 mb-2" />
                                <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={contactForm.phone}
                                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tiêu đề *
                            </label>
                            <input
                                type="text"
                                required
                                value={contactForm.subject}
                                onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nội dung *
                            </label>
                            <textarea
                                rows={5}
                                required
                                value={contactForm.message}
                                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Gửi yêu cầu
                        </button>
                    </form>
                </div>

                {/* FAQ */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Câu hỏi thường gặp</h2>
                    
                    <div className="space-y-6">
                        {faqData.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.category}</h3>
                                <div className="space-y-4">
                                    {section.questions.map((faq, faqIndex) => (
                                        <div key={faqIndex}>
                                            <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Resources */}
                    <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Tài nguyên hữu ích</h3>
                        <div className="space-y-2">
                            <a href="#" className="block text-blue-700 hover:text-blue-900 hover:underline">
                                📖 Hướng dẫn sử dụng sản phẩm
                            </a>
                            <a href="#" className="block text-blue-700 hover:text-blue-900 hover:underline">
                                🔧 Công cụ chẩn đoán trực tuyến
                            </a>
                            <a href="#" className="block text-blue-700 hover:text-blue-900 hover:underline">
                                📱 Tải ứng dụng Apple Support
                            </a>
                            <a href="#" className="block text-blue-700 hover:text-blue-900 hover:underline">
                                🏪 Tìm cửa hàng gần nhất
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
