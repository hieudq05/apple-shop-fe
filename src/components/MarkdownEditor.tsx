import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Bold,
    Italic,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Link,
    Image,
    Eye,
    Edit,
    Save,
    Undo,
    Redo,
    Split,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    onSave?: (value: string) => void;
    placeholder?: string;
    height?: string | number;
    readOnly?: boolean;
    showToolbar?: boolean;
    showPreview?: boolean;
    className?: string;
}

const MarkdownEditor = ({
    value = '',
    onChange,
    onSave,
    placeholder = 'Nhập nội dung markdown...',
    height = 400,
    readOnly = false,
    showToolbar = true,
    showPreview = true,
    className = ''
}: MarkdownEditorProps) => {
    // Sử dụng controlled component hoàn toàn
    const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
    const [history, setHistory] = useState<string[]>([value]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isComposingRef = useRef(false);
    const lastValueRef = useRef(value);

    // Memoize counts để tránh re-calculation
    const { wordCount, charCount } = useMemo(() => {
        const words = value.trim() ? value.trim().split(/\s+/).length : 0;
        return { wordCount: words, charCount: value.length };
    }, [value]);

    // Update history chỉ khi cần thiết
    const updateHistoryRef = useRef<NodeJS.Timeout | null>(null);
    const updateHistory = useCallback((newValue: string) => {
        if (updateHistoryRef.current) {
            clearTimeout(updateHistoryRef.current);
        }

        updateHistoryRef.current = setTimeout(() => {
            setHistory(prev => {
                const lastValue = prev[prev.length - 1];
                if (lastValue === newValue) return prev;

                const newHistory = [...prev.slice(0, historyIndex + 1), newValue];
                const limitedHistory = newHistory.slice(-20);
                setHistoryIndex(limitedHistory.length - 1);
                return limitedHistory;
            });
        }, 1500); // Tăng delay cho history để không ảnh hưởng typing
    }, [historyIndex]);

    // Handle change - tối ưu cho tiếng Việt
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;

        // Gọi onChange ngay lập tức để tránh delay
        if (onChange && newValue !== lastValueRef.current) {
            onChange(newValue);
            lastValueRef.current = newValue;
        }

        // Update history với delay
        if (!isComposingRef.current) {
            updateHistory(newValue);
        }
    }, [onChange, updateHistory]);

    // Handle composition events cho tiếng Việt
    const handleCompositionStart = useCallback(() => {
        isComposingRef.current = true;
    }, []);

    const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLTextAreaElement>) => {
        isComposingRef.current = false;
        const newValue = e.currentTarget.value;
        updateHistory(newValue);
    }, [updateHistory]);

    // Insert markdown syntax - tối ưu cursor positioning
    const insertMarkdown = useCallback((syntaxStart: string, syntaxEnd = '', placeholderText = '') => {
        if (!textareaRef.current || !onChange) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.slice(start, end);
        const textToInsert = selected || placeholderText;

        const newText =
            value.substring(0, start) +
            syntaxStart + textToInsert + syntaxEnd +
            value.substring(end);

        // Update value ngay lập tức
        onChange(newText);
        updateHistory(newText);

        // Set cursor position với requestAnimationFrame để đảm bảo DOM đã update
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                const newCursorPos = start + syntaxStart.length + textToInsert.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                textareaRef.current.focus();
            }
        });
    }, [value, onChange, updateHistory]);

    // Insert alignment for selected lines
    const insertAlignment = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
        if (!textareaRef.current || !onChange) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        // Tìm start và end của các dòng được chọn
        const lines = value.split('\n');
        let startLineIndex = 0;
        let endLineIndex = 0;
        let charCount = 0;

        // Tìm dòng bắt đầu
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= start) {
                startLineIndex = i;
                break;
            }
            charCount += lines[i].length + 1; // +1 cho \n
        }

        // Tìm dòng kết thúc
        charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= end) {
                endLineIndex = i;
                break;
            }
            charCount += lines[i].length + 1;
        }

        // Xử lý các dòng được chọn
        const modifiedLines = lines.map((line, index) => {
            if (index >= startLineIndex && index <= endLineIndex) {
                // Loại bỏ các alignment markers cũ nếu có
                let cleanLine = line.replace(/^:::(left|center|right|justify)\s*\n?/, '');
                cleanLine = cleanLine.replace(/\n?:::$/, '');

                if (alignment === 'left') {
                    // Left alignment là mặc định, không cần marker
                    return cleanLine;
                } else {
                    // Thêm alignment marker
                    return `:::${alignment}\n${cleanLine}\n:::`;
                }
            }
            return line;
        });

        const newText = modifiedLines.join('\n');
        onChange(newText);
        updateHistory(newText);

        // Giữ nguyên selection
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.setSelectionRange(start, end);
                textareaRef.current.focus();
            }
        });
    }, [value, onChange, updateHistory]);

    // Undo/Redo
    const undo = useCallback(() => {
        if (historyIndex > 0 && onChange) {
            const newIndex = historyIndex - 1;
            const newValue = history[newIndex];
            setHistoryIndex(newIndex);
            onChange(newValue);
            lastValueRef.current = newValue;
        }
    }, [history, historyIndex, onChange]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && onChange) {
            const newIndex = historyIndex + 1;
            const newValue = history[newIndex];
            setHistoryIndex(newIndex);
            onChange(newValue);
            lastValueRef.current = newValue;
        }
    }, [history, historyIndex, onChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'b':
                        e.preventDefault();
                        insertMarkdown('**', '**', 'bold text');
                        break;
                    case 'i':
                        e.preventDefault();
                        insertMarkdown('*', '*', 'italic text');
                        break;
                    case 's':
                        e.preventDefault();
                        if (onSave) {
                            onSave(value);
                        }
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            redo();
                        } else {
                            undo();
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [insertMarkdown, value, onSave, undo, redo]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (updateHistoryRef.current) {
                clearTimeout(updateHistoryRef.current);
            }
        };
    }, []);

    // Update lastValueRef when value prop changes
    useEffect(() => {
        lastValueRef.current = value;
    }, [value]);

    const toolbarButtons = [
        { icon: Bold, action: () => insertMarkdown('**', '**', 'bold text'), tooltip: 'Bold (Ctrl+B)' },
        { icon: Italic, action: () => insertMarkdown('*', '*', 'italic text'), tooltip: 'Italic (Ctrl+I)' },
        { icon: Code, action: () => insertMarkdown('`', '`', 'code'), tooltip: 'Inline Code' },
        { separator: true },
        { icon: Heading1, action: () => insertMarkdown('# ', '', 'Heading 1'), tooltip: 'Heading 1' },
        { icon: Heading2, action: () => insertMarkdown('## ', '', 'Heading 2'), tooltip: 'Heading 2' },
        { icon: Heading3, action: () => insertMarkdown('### ', '', 'Heading 3'), tooltip: 'Heading 3' },
        { separator: true },
        { icon: List, action: () => insertMarkdown('- ', '', 'List item'), tooltip: 'Bullet List' },
        { icon: ListOrdered, action: () => insertMarkdown('1. ', '', 'List item'), tooltip: 'Numbered List' },
        { icon: Quote, action: () => insertMarkdown('> ', '', 'Quote'), tooltip: 'Quote' },
        { separator: true },
        { icon: Link, action: () => insertMarkdown('[', '](url)', 'link text'), tooltip: 'Link' },
        { icon: Image, action: () => insertMarkdown('![', '](image-url)', 'alt text'), tooltip: 'Image' },
        { separator: true },
        { icon: AlignLeft, action: () => insertAlignment('left'), tooltip: 'Align Left' },
        { icon: AlignCenter, action: () => insertAlignment('center'), tooltip: 'Align Center' },
        { icon: AlignRight, action: () => insertAlignment('right'), tooltip: 'Align Right' },
        { icon: AlignJustify, action: () => insertAlignment('justify'), tooltip: 'Align Justify' },
        { separator: true },
        { icon: Undo, action: undo, tooltip: 'Undo (Ctrl+Z)', disabled: historyIndex === 0 },
        { icon: Redo, action: redo, tooltip: 'Redo (Ctrl+Shift+Z)', disabled: historyIndex === history.length - 1 },
    ];

    return (
        <TooltipProvider>
            <Card className={`markdown-editor overflow-hidden pb-0 ${className}`}>
                {showToolbar && (
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Markdown Editor</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {wordCount} words, {charCount} chars
                                </Badge>
                                {onSave && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onSave(value)}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Save (Ctrl+S)</TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                            {toolbarButtons.map((button, index) => {
                                if (button.separator) {
                                    return <Separator key={index} orientation="vertical" className="h-6" />;
                                }

                                const Icon = button.icon!;
                                return (
                                    <Tooltip key={index}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={button.action}
                                                disabled={button.disabled || readOnly}
                                                className="h-8 w-8 p-0"
                                            >
                                                <Icon className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>{button.tooltip}</TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        {showPreview && (
                            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="edit" className="flex items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit
                                    </TabsTrigger>
                                    <TabsTrigger value="preview" className="flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </TabsTrigger>
                                    <TabsTrigger value="split" className="flex items-center gap-2">
                                        <Split className="h-4 w-4" />
                                        Split
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        )}
                    </CardHeader>
                )}

                <CardContent className="p-0">
                    {!showPreview || viewMode === 'edit' ? (
                        <Textarea
                            ref={textareaRef}
                            value={value}
                            onChange={handleChange}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                            placeholder={placeholder}
                            style={{ height }}
                            className="resize-none border-0 rounded-none focus-visible:ring-0"
                            readOnly={readOnly}
                        />
                    ) : viewMode === 'preview' ? (
                        <ScrollArea style={{ height }} className="p-4">
                            <MarkdownRenderer content={value} />
                        </ScrollArea>
                    ) : (
                        <div className="grid grid-cols-2 h-full">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={handleChange}
                                onCompositionStart={handleCompositionStart}
                                onCompositionEnd={handleCompositionEnd}
                                placeholder={placeholder}
                                style={{ height }}
                                className="resize-none border-0 rounded-none focus-visible:ring-0 border-r"
                                readOnly={readOnly}
                            />
                            <ScrollArea style={{ height }} className="p-4">
                                <MarkdownRenderer content={value} />
                            </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};

export default MarkdownEditor;
