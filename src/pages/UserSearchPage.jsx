import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { useAuth } from '../auth/AuthContext'; // 💡 追加：自分のログイン情報を取得するツール
import { toggleFollow } from '../api/follows'; // 💡 追加：さっき作ったフォロー用の通信ツール

const UserSearchPage = () => {
    const { user: currentUser } = useAuth(); // 💡 現在ログインしている「自分」の情報を取得
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchedKeyword, setSearchedKeyword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (searchWord = '') => {
        setIsLoading(true);
        try {
            const url = searchWord ? `/users?keyword=${searchWord}` : '/users';
            const data = await apiFetch(url);
            setUsers(data);
            setSearchedKeyword(searchWord);
        } catch (error) {
            console.error('ユーザー情報の取得に失敗しました', error);
        } finally {
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

    // 💡 追加：フォローボタンが押された時の処理
    const handleToggleFollow = async (targetUserId) => {
        try {
            // 裏側のAPIを叩く
            const result = await toggleFollow(targetUserId);

            // 通信に成功したら、画面のリストを書き換えてボタンの見た目（フォロー中か否か）を更新する
            setUsers((prevUsers) =>
                prevUsers.map((u) =>
                    u.id === targetUserId
                        ? { ...u, is_following: result.is_following }
                        : u
                )
            );
        } catch (error) {
            console.error('フォロー操作エラー:', error);
            alert('フォローの操作に失敗しました。');
        }
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

            {isLoading ? (
                <p style={{ color: '#666' }}>読み込み中...</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {users.map((user) => {
                        // 💡 自分自身かどうかを判定
                        const isMe = currentUser?.id === user.id;

                        return (
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

                                {/* 💡 自分以外のユーザーにだけフォローボタンを表示する */}
                                {!isMe && (
                                    <button
                                        onClick={() => handleToggleFollow(user.id)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '999px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            // フォロー中なら白抜きのデザインに切り替える
                                            backgroundColor: user.is_following ? 'white' : '#222',
                                            color: user.is_following ? '#222' : 'white',
                                            border: '1px solid #222'
                                        }}
                                    >
                                        {user.is_following ? 'フォロー解除' : 'フォローする'}
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {!isLoading && users.length === 0 && !error && (
                <p style={{ color: '#b00020', fontWeight: 'bold', marginTop: '10px' }}>
                    見つかりませんでした
                </p>
            )}
        </div>
    );
};

export default UserSearchPage;
