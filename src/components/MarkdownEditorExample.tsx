import {useState} from 'react';
import MarkdownEditor from './MarkdownEditor';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {useToast} from '@/hooks/use-toast';

const MarkdownEditorExample = () => {
    const [content, setContent] = useState(`# Chào mừng đến với Markdown Editor

## Tính năng chính

### 1. Toolbar chuyên nghiệp
- **Bold** và *italic* text
- \`Inline code\`
- Headings (H1, H2, H3)
- Lists và quotes

### 2. Live Preview
- Xem trước real-time
- Split view (edit + preview)
- Responsive design

### 3. Keyboard Shortcuts
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic  
- **Ctrl+S**: Save
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo

### 4. Auto-save
Tự động lưu nội dung mỗi 3 giây

> Đây là một quote example

\`\`\`javascript
// Code block example
const hello = () => {
    console.log("Hello World!");
};
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

## Links và Images
[Link example](https://github.com)
![Image example](https://via.placeholder.com/300x200)
`);

    const [savedContent, setSavedContent] = useState('');
    const {toast} = useToast();

    const handleSave = (value: string) => {
        setSavedContent(value);
        toast({
            title: "Đã lưu thành công!",
            description: "Nội dung markdown đã được lưu.",
        });
    };

    const handleChange = (value: string) => {
        setContent(value);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Professional Markdown Editor</h1>
                <p className="text-muted-foreground">
                    Powered by shadcn/ui với đầy đủ tính năng chuyên nghiệp
                </p>
            </div>

            {/* Example 1: Full Featured Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Editor với đầy đủ tính năng
                        <Badge variant="default">Full Features</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MarkdownEditor
                        initialValue={content}
                        onChange={handleChange}
                        onSave={handleSave}
                        height={500}
                        autoSave={true}
                        autoSaveInterval={3000}
                        placeholder="Nhập nội dung markdown của bạn..."
                        className="border"
                    />
                </CardContent>
            </Card>

            {/* Example 2: Read-only Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Read-only Preview
                        <Badge variant="secondary">Preview Only</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MarkdownEditor
                        initialValue={content}
                        readOnly={true}
                        showToolbar={false}
                        height={300}
                        className="border"
                    />
                </CardContent>
            </Card>

            {/* Example 3: Simple Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Simple Editor
                        <Badge variant="outline">Minimal</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <MarkdownEditor
                        initialValue="# Simple Editor\n\nChỉ có toolbar và edit mode"
                        onChange={(value) => console.log('Simple editor change:', value)}
                        showPreview={false}
                        height={200}
                        placeholder="Editor đơn giản..."
                        className="border"
                    />
                </CardContent>
            </Card>

            {/* Saved Content Display */}
            {savedContent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Nội dung đã lưu
                            <Badge variant="success">Saved</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">
                                Độ dài: {savedContent.length} ký tự
                            </p>
                            <pre className="text-xs overflow-auto max-h-32">
                                {savedContent}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Usage Examples */}
            <Card>
                <CardHeader>
                    <CardTitle>Cách sử dụng trong các trang khác</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">1. Blog Post Editor:</h4>
                        <pre className="text-sm overflow-auto">
{`<MarkdownEditor
    initialValue={blogPost.content}
    onChange={(content) => setBlogPost({...blogPost, content})}
    onSave={saveBlogPost}
    height={600}
    autoSave={true}
    placeholder="Viết bài blog của bạn..."
/>`}
                        </pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">2. Product Description Editor:</h4>
                        <pre className="text-sm overflow-auto">
{`<MarkdownEditor
    initialValue={product.description}
    onChange={(description) => setProduct({...product, description})}
    height={400}
    showPreview={true}
    placeholder="Mô tả sản phẩm..."
/>`}
                        </pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">3. Comment Editor:</h4>
                        <pre className="text-sm overflow-auto">
{`<MarkdownEditor
    onChange={(content) => setComment(content)}
    height={200}
    showPreview={false}
    placeholder="Viết bình luận..."
    className="border-0"
/>`}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MarkdownEditorExample;
