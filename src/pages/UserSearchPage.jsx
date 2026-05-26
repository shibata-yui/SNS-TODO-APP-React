import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

const UserSearchPage = () => {
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchedKeyword, setSearchedKeyword] = useState('');
    const [error, setError] = useState('');

    // 💡 追加：データ取得中かどうかを判定する箱（最初は「取得中」にする）
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (searchWord = '') => {
        setIsLoading(true); // 通信スタート時に「取得中」をオンにする
        try {
            const url = searchWord ? `/users?keyword=${searchWord}` : '/users';
            const data = await apiFetch(url);
            setUsers(data);
            setSearchedKeyword(searchWord);
        } catch (error) {
            console.error('ユーザー情報の取得に失敗しました', error);
        } finally {
            // 通信が終わったら（成功でも失敗でも）「取得中」をオフにする
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        if (!keyword.trim()) {
            setError('文字を入力してください');
            return;
        }

        setError('');
        fetchUsers(keyword);
    };

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '20px' }}>
            <h2>ユーザー検索</h2>

            <form onSubmit={handleSearch} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="ユーザー名で検索"
                    value={keyword}
                    onChange={(e) => {
                        setKeyword(e.target.value);
                        if (error) setError('');
                    }}
                    style={{ padding: '8px', flexGrow: 1, border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '8px 16px',
                        cursor: 'pointer',
                        backgroundColor: '#222',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    検索
                </button>
            </form>

            {/* 💡 修正：背景色と余白（padding）を削除してスッキリとした赤文字のみに */}
            {error && (
                <p style={{ color: '#b00020', fontWeight: 'bold', marginBottom: '10px' }}>
                    {error}
                </p>
            )}

            {searchedKeyword && !error && (
                <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                    「{searchedKeyword}」の検索結果
                </p>
            )}

            {/* 💡 追加：データ取得中は「読み込み中...」と表示してチラつきを防ぐ */}
            {isLoading ? (
                <p style={{ color: '#666' }}>読み込み中...</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <span style={{ fontWeight: 'bold' }}>{user.name}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* 💡 修正：「ローディング中じゃない時だけ」という条件(!isLoading)を追加し、チラつきを防止。背景色も削除。 */}
            {!isLoading && users.length === 0 && !error && (
                <p style={{ color: '#b00020', fontWeight: 'bold', marginTop: '10px' }}>
                    見つかりませんでした
                </p>
            )}
        </div>
    );
};

export default UserSearchPage;
