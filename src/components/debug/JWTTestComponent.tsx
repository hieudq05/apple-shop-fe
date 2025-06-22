import React, { useState } from 'react';
import { decodeJWT } from '../../utils/jwt';
import { testUnicodeDecoding, compareEncodingMethods, createTestJWT, createTestJWTWithProperEncoding } from '../../utils/testJWT';

const JWTTestComponent: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [customFirstName, setCustomFirstName] = useState('Dương');
    const [customLastName, setCustomLastName] = useState('Quốc Hiếu');

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runBasicTest = () => {
        addResult('=== Running Basic Unicode Test ===');
        
        try {
            const testToken = createTestJWT(customFirstName, customLastName);
            addResult(`Created token: ${testToken.substring(0, 50)}...`);
            
            const decoded = decodeJWT(testToken);
            if (decoded) {
                addResult(`Decoded firstName: "${decoded.firstName}"`);
                addResult(`Decoded lastName: "${decoded.lastName}"`);
                addResult(`Expected firstName: "${customFirstName}"`);
                addResult(`Expected lastName: "${customLastName}"`);
                
                const isCorrect = decoded.firstName === customFirstName && decoded.lastName === customLastName;
                addResult(`✅ Test ${isCorrect ? 'PASSED' : 'FAILED'}`);
                
                if (!isCorrect) {
                    addResult(`❌ firstName match: ${decoded.firstName === customFirstName}`);
                    addResult(`❌ lastName match: ${decoded.lastName === customLastName}`);
                }
            } else {
                addResult('❌ Failed to decode token');
            }
        } catch (error) {
            addResult(`❌ Error: ${error}`);
        }
        
        addResult('=== End Basic Test ===');
    };

    const runAdvancedTest = () => {
        addResult('=== Running Advanced Unicode Test ===');
        
        try {
            const testToken = createTestJWTWithProperEncoding(customFirstName, customLastName);
            addResult(`Created token with proper encoding: ${testToken.substring(0, 50)}...`);
            
            const decoded = decodeJWT(testToken);
            if (decoded) {
                addResult(`Decoded firstName: "${decoded.firstName}"`);
                addResult(`Decoded lastName: "${decoded.lastName}"`);
                
                const isCorrect = decoded.firstName === customFirstName && decoded.lastName === customLastName;
                addResult(`✅ Advanced test ${isCorrect ? 'PASSED' : 'FAILED'}`);
            } else {
                addResult('❌ Failed to decode token with proper encoding');
            }
        } catch (error) {
            addResult(`❌ Error: ${error}`);
        }
        
        addResult('=== End Advanced Test ===');
    };

    const runComparisonTest = () => {
        addResult('=== Running Comparison Test ===');
        
        try {
            // Test multiple Vietnamese names
            const testNames = [
                { firstName: 'Dương', lastName: 'Quốc Hiếu' },
                { firstName: 'Nguyễn', lastName: 'Văn Anh' },
                { firstName: 'Trần', lastName: 'Thị Bình' },
                { firstName: 'Lê', lastName: 'Minh Châu' },
                { firstName: 'Phạm', lastName: 'Hoàng Đức' }
            ];

            testNames.forEach((name, index) => {
                addResult(`--- Testing name ${index + 1}: ${name.firstName} ${name.lastName} ---`);
                
                // Basic method
                const token1 = createTestJWT(name.firstName, name.lastName);
                const decoded1 = decodeJWT(token1);
                const basic_correct = decoded1?.firstName === name.firstName && decoded1?.lastName === name.lastName;
                
                // Advanced method
                const token2 = createTestJWTWithProperEncoding(name.firstName, name.lastName);
                const decoded2 = decodeJWT(token2);
                const advanced_correct = decoded2?.firstName === name.firstName && decoded2?.lastName === name.lastName;
                
                addResult(`Basic method: ${basic_correct ? '✅ PASS' : '❌ FAIL'} - "${decoded1?.firstName} ${decoded1?.lastName}"`);
                addResult(`Advanced method: ${advanced_correct ? '✅ PASS' : '❌ FAIL'} - "${decoded2?.firstName} ${decoded2?.lastName}"`);
            });
        } catch (error) {
            addResult(`❌ Error: ${error}`);
        }
        
        addResult('=== End Comparison Test ===');
    };

    const clearResults = () => {
        setTestResults([]);
    };

    const runConsoleTests = () => {
        addResult('Running console tests... Check browser console for detailed output');
        testUnicodeDecoding();
        compareEncodingMethods();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">JWT Unicode Testing Tool</h2>
            
            {/* Input Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Input</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name (Tên)
                        </label>
                        <input
                            type="text"
                            value={customFirstName}
                            onChange={(e) => setCustomFirstName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Dương"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name (Họ)
                        </label>
                        <input
                            type="text"
                            value={customLastName}
                            onChange={(e) => setCustomLastName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Quốc Hiếu"
                        />
                    </div>
                </div>
            </div>

            {/* Test Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
                <button
                    onClick={runBasicTest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Run Basic Test
                </button>
                <button
                    onClick={runAdvancedTest}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Run Advanced Test
                </button>
                <button
                    onClick={runComparisonTest}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Run Comparison Test
                </button>
                <button
                    onClick={runConsoleTests}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                    Run Console Tests
                </button>
                <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Clear Results
                </button>
            </div>

            {/* Results Section */}
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                <h3 className="text-white text-lg font-semibold mb-3">Test Results:</h3>
                {testResults.length === 0 ? (
                    <p className="text-gray-400">No tests run yet. Click a test button to start.</p>
                ) : (
                    <div className="space-y-1">
                        {testResults.map((result, index) => (
                            <div key={index} className={`${
                                result.includes('❌') ? 'text-red-400' :
                                result.includes('✅') ? 'text-green-400' :
                                result.includes('===') ? 'text-yellow-400 font-bold' :
                                'text-gray-300'
                            }`}>
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                    <li>• <strong>Basic Test:</strong> Tests the current JWT decoding with your input</li>
                    <li>• <strong>Advanced Test:</strong> Tests improved Unicode encoding method</li>
                    <li>• <strong>Comparison Test:</strong> Tests multiple Vietnamese names with both methods</li>
                    <li>• <strong>Console Tests:</strong> Runs detailed tests in browser console</li>
                    <li>• Enter Vietnamese names with diacritics to test Unicode handling</li>
                    <li>• Check if decoded names match exactly with input names</li>
                </ul>
            </div>
        </div>
    );
};

export default JWTTestComponent;
