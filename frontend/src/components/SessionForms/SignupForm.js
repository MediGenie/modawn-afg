import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { signup, clearSessionErrors } from '../../store/session';
import { useHistory } from 'react-router-dom';
import { useQuery } from '../Routes/Routes'; 
import { Link } from 'react-router-dom';

function SignupForm () {
  const [email, setEmail] = useState('');
  const [name, setname] = useState('');
  const [company_id, setcompany_id] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const { query } = useQuery();
const redirectPath = query.get('redirect');
const history = useHistory();
const isLoggedIn = useSelector(state => !!state.session.user); // Adjust based on your state management
const loginUrlWithRedirect = redirectPath ? `/login?redirect=${redirectPath}` : '/login';


useEffect(() => {
  if (isLoggedIn) {
    history.push(redirectPath || '/defaultRedirectPath');
  }
}, [isLoggedIn, history, redirectPath]);

  const errors = useSelector(state => state.errors.session);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(clearSessionErrors());
    };
  }, [dispatch]);

  const update = field => {
    let setState;

    switch (field) {
      case 'email':
        setState = setEmail;
        break;
      case 'name':
        setState = setname;
        break;
      case 'password':
        setState = setPassword;
        break;
      case 'company_id':
        setState = setcompany_id;
        break;
      default:
        throw Error('Unknown field in Signup Form');
    }

    return e => setState(e.currentTarget.value);
  }


  const nameSubmit = e => {
    e.preventDefault();
    const user = {
      email,
      name,
      company_id,
      password
    };
  
    dispatch(signup(user, redirectPath));
  }

  return (
    <div className="session-form-container">
      <form className="session-form signup" onSubmit={nameSubmit}>
        <h2>가입하기</h2>
        <div className="errors">{errors?.email}</div>
        <label>
          <span>이메일</span>
          <input type="text"
            value={email}
            onChange={update('email')}
            placeholder="이메일"
          />
        </label>
        <div className="errors">{errors?.company_id}</div>
        <label>
          <span>회사번호</span>
          <input type="text"
            value={company_id}
            onChange={update('company_id')}
            placeholder="0000"
          />  
        </label>
        <div className="errors">{errors?.name}</div>
        <label>
          <span>이름</span>
          <input type="text"
            value={name}
            onChange={update('name')}
            placeholder="홍길동"
          />
        </label>
        <div className="errors">{errors?.password}</div>
        <label>
          <span>비밀번호</span>
          <input type="password"
            value={password}
            onChange={update('password')}
            placeholder="비밀번호"
          />
        </label>
        <input
          type="submit"
          value="가입하기"
          disabled={!email || !name || !password}
        />
        
        <Link to={loginUrlWithRedirect} className="login-link">혹시 계정있으세요? 로그인</Link>

    

      </form>

    </div>
  );
}

export default SignupForm;